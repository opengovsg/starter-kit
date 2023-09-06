import { NodeSDK } from '@opentelemetry/sdk-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { Resource } from '@opentelemetry/resources'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-node'
import { env } from '~/env.mjs'

export function register() {
  const sdk = new NodeSDK({
    resource: new Resource({
      // NOTE: You can replace env.NEXT_PUBLIC_APP_NAME with the actual name of your project
      [SemanticResourceAttributes.SERVICE_NAME]: env.NEXT_PUBLIC_APP_NAME,
    }),
    spanProcessor: new SimpleSpanProcessor(new OTLPTraceExporter()),
  })

  sdk.start()
}
