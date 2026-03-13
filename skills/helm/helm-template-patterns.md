---
id: helm-template-patterns
stackId: helm
type: skill
name: >-
  Helm Template Patterns & Helpers
description: >-
  Write reusable Helm template helpers with _helpers.tpl — standard labels,
  name generation, conditional resources, range loops, and named templates for
  DRY chart development.
difficulty: intermediate
tags:
  - helm
  - template
  - patterns
  - helpers
  - deployment
  - kubernetes
  - machine-learning
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: "When should I use the Helm Template Patterns & Helpers skill?"
    answer: >-
      Write reusable Helm template helpers with _helpers.tpl — standard
      labels, name generation, conditional resources, range loops, and named
      templates for DRY chart development. It includes practical examples for
      Kubernetes packaging development.
  - question: "What tools and setup does Helm Template Patterns & Helpers require?"
    answer: >-
      Requires Helm CLI installed. Works with Helm projects. Review the
      configuration section for project-specific setup.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Helm Template Patterns & Helpers

## Overview
Helm templates use Go template syntax with Sprig functions. The _helpers.tpl file contains reusable template definitions (named templates) that eliminate duplication across chart resources.

## Why This Matters
- **DRY** — define labels, names, and selectors once, use everywhere
- **Consistency** — standard labels across all resources
- **Maintainability** — change label format in one place
- **Readability** — named templates are self-documenting

## Standard _helpers.tpl
```yaml
{{/* templates/_helpers.tpl */}}

{{/*
Chart name, truncated to 63 characters.
*/}}
{{- define "myapp.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Fully qualified app name.
*/}}
{{- define "myapp.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Standard labels.
*/}}
{{- define "myapp.labels" -}}
helm.sh/chart: {{ include "myapp.chart" . }}
{{ include "myapp.selectorLabels" . }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels.
*/}}
{{- define "myapp.selectorLabels" -}}
app.kubernetes.io/name: {{ include "myapp.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Service account name.
*/}}
{{- define "myapp.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "myapp.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}
```

## Using Helpers in Templates
```yaml
# templates/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "myapp.fullname" . }}
  labels:
    {{- include "myapp.labels" . | nindent 4 }}
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      {{- include "myapp.selectorLabels" . | nindent 6 }}
  template:
    metadata:
      labels:
        {{- include "myapp.selectorLabels" . | nindent 8 }}
    spec:
      serviceAccountName: {{ include "myapp.serviceAccountName" . }}
      containers:
        - name: {{ .Chart.Name }}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}"
```

## Conditional Resources
```yaml
# templates/ingress.yaml
{{- if .Values.ingress.enabled -}}
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: {{ include "myapp.fullname" . }}
  labels:
    {{- include "myapp.labels" . | nindent 4 }}
  {{- with .Values.ingress.annotations }}
  annotations:
    {{- toYaml . | nindent 4 }}
  {{- end }}
spec:
  {{- if .Values.ingress.className }}
  ingressClassName: {{ .Values.ingress.className }}
  {{- end }}
  rules:
    {{- range .Values.ingress.hosts }}
    - host: {{ .host | quote }}
      http:
        paths:
          {{- range .paths }}
          - path: {{ .path }}
            pathType: {{ .pathType }}
            backend:
              service:
                name: {{ include "myapp.fullname" $ }}
                port:
                  number: {{ $.Values.service.port }}
          {{- end }}
    {{- end }}
{{- end }}
```

## Environment Variables from ConfigMap/Secret
```yaml
# templates/deployment.yaml (container spec)
env:
  {{- range .Values.env }}
  - name: {{ .name }}
    {{- if .value }}
    value: {{ .value | quote }}
    {{- else if .valueFrom }}
    valueFrom:
      {{- toYaml .valueFrom | nindent 6 }}
    {{- end }}
  {{- end }}
```

## Best Practices
- Use `include` (not `template`) — include can be piped to nindent
- Always use `nindent` for proper YAML indentation
- Use `with` to simplify nested value access
- Use `default` for fallback values
- Validate with `helm template` before installing
- Use `{{- and -}}` to control whitespace

## Common Mistakes
- Using `template` instead of `include` (cannot pipe output)
- Wrong indentation (missing nindent, wrong level)
- Not quoting strings with `quote` (YAML parsing errors)
- Forgetting `$` for root context inside range loops
