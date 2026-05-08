import {
  CTF_EXCHANGE_ADDRESS,
  LEGACY_NEG_RISK_CTF_EXCHANGE_ADDRESS,
  NEG_RISK_CTF_EXCHANGE_ADDRESS,
  UMA_NEG_RISK_ADAPTER_ADDRESS,
  UMA_NEG_RISK_ADAPTER_LEGACY_ADDRESS,
} from '@/lib/contracts'
import { normalizeAddress } from '@/lib/wallet'

interface MarketAdapterSource {
  condition?: {
    oracle?: string | null
  } | null
  metadata?: unknown
}

function readAdapterAddress(source: unknown): `0x${string}` | null {
  if (!source || typeof source !== 'object') {
    return null
  }

  const record = source as Record<string, unknown>
  const value = record.adapter_address
    ?? record.adapterAddress
    ?? record.resolution_adapter_address
    ?? record.resolutionAdapterAddress
  if (typeof value !== 'string') {
    return null
  }

  return normalizeAddress(value)
}

function parseMetadata(metadata: unknown): unknown {
  if (typeof metadata !== 'string') {
    return metadata
  }

  try {
    return JSON.parse(metadata) as unknown
  }
  catch {
    return null
  }
}

export function resolveNegRiskAdapterAddressFromMarket(
  market: MarketAdapterSource | null | undefined,
): `0x${string}` | null {
  if (!market) {
    return null
  }

  const metadataAdapter = readAdapterAddress(parseMetadata(market.metadata))
  if (metadataAdapter) {
    return metadataAdapter
  }

  return normalizeAddress(market.condition?.oracle)
}

export function resolveNegRiskExchangeAddressFromAdapter(
  adapterAddress: string | null | undefined,
): `0x${string}` | null {
  const adapter = normalizeAddress(adapterAddress)
  if (!adapter) {
    return null
  }

  if (adapter.toLowerCase() === UMA_NEG_RISK_ADAPTER_LEGACY_ADDRESS.toLowerCase()) {
    return LEGACY_NEG_RISK_CTF_EXCHANGE_ADDRESS
  }

  if (adapter.toLowerCase() === UMA_NEG_RISK_ADAPTER_ADDRESS.toLowerCase()) {
    return NEG_RISK_CTF_EXCHANGE_ADDRESS
  }

  return null
}

export function resolveExchangeAddressForMarket(
  market: MarketAdapterSource | null | undefined,
  isNegRisk: boolean,
): `0x${string}` | null {
  if (!isNegRisk) {
    return CTF_EXCHANGE_ADDRESS
  }

  return resolveNegRiskExchangeAddressFromAdapter(resolveNegRiskAdapterAddressFromMarket(market))
}
