import { appKit, extendedAppKit } from '@/lib/appkit-config'
import { getNetworkById } from '@/lib/network-config'

export interface SmartSessionPermission {
  type: 'contract-call' | 'transaction' | 'balance'
  data?: {
    address?: `0x${string}`
    abi?: Record<string, unknown>[]
    functions?: {
      functionName: string
      args?: {
        operator: 'EQUAL' | 'GREATER_THAN' | 'LESS_THAN'
        value: `0x${string}`
      }[]
      valueLimit?: `0x${string}`
      operation?: 'Call' | 'DelegateCall'
    }[]
  }
}

export interface SmartSessionRequest {
  permissions: SmartSessionPermission[]
  sessionDuration?: number // in seconds
  description?: string
}

export interface SmartSessionResponse {
  sessionId: string
  permissions: SmartSessionPermission[]
  expiresAt: number
  walletAddress: string
}

export class SmartSessionService {
  private static instance: SmartSessionService
  private activeSessions: Map<string, SmartSessionResponse> = new Map()

  static getInstance(): SmartSessionService {
    if (!SmartSessionService.instance) {
      SmartSessionService.instance = new SmartSessionService()
    }
    return SmartSessionService.instance
  }

  // Request Smart Session permissions
  async requestPermissions(request: SmartSessionRequest): Promise<SmartSessionResponse> {
    try {
      // Check if AppKit supports Smart Sessions
      if (!extendedAppKit.modal || !extendedAppKit.connection) {
        throw new Error('AppKit not properly initialized for Smart Sessions')
      }

      // Open AppKit modal for Smart Session request
      await extendedAppKit.modal.open()

      // Wait for Smart Session approval
      const sessionResponse = await this.waitForSmartSessionApproval(request)
      
      if (!sessionResponse) {
        throw new Error('Smart Session request was rejected or timed out')
      }

      // Store the active session
      this.activeSessions.set(sessionResponse.sessionId, sessionResponse)

      return sessionResponse
    } catch (error) {
      throw new Error(`Failed to request Smart Session permissions: ${error}`)
    }
  }

  // Execute transaction using Smart Session
  async executeTransaction(
    sessionId: string,
    chainId: string,
    transaction: {
      to: `0x${string}`
      data: `0x${string}`
      value?: `0x${string}`
    }
  ): Promise<string> {
    try {
      const session = this.activeSessions.get(sessionId)
      if (!session) {
        throw new Error('Smart Session not found or expired')
      }

      if (Date.now() > session.expiresAt) {
        this.activeSessions.delete(sessionId)
        throw new Error('Smart Session has expired')
      }

      // Use AppKit's Smart Session capabilities to execute transaction
      const result = await this.executeWithSmartSession(sessionId, chainId, transaction)
      
      return result
    } catch (error) {
      throw new Error(`Failed to execute transaction with Smart Session: ${error}`)
    }
  }

  // Execute contract call using Smart Session
  async executeContractCall(
    sessionId: string,
    chainId: string,
    contractCall: {
      to: `0x${string}`
      data: `0x${string}`
      value?: `0x${string}`
      functionName: string
      args?: any[]
    }
  ): Promise<string> {
    try {
      const session = this.activeSessions.get(sessionId)
      if (!session) {
        throw new Error('Smart Session not found or expired')
      }

      if (Date.now() > session.expiresAt) {
        this.activeSessions.delete(sessionId)
        throw new Error('Smart Session has expired')
      }

      // Validate contract call against permissions
      this.validateContractCall(session, contractCall)

      // Execute contract call using Smart Session
      const result = await this.executeWithSmartSession(sessionId, chainId, {
        to: contractCall.to,
        data: contractCall.data,
        value: contractCall.value || '0x0'
      })

      return result
    } catch (error) {
      throw new Error(`Failed to execute contract call with Smart Session: ${error}`)
    }
  }

  // Get balance using Smart Session
  async getBalance(sessionId: string, chainId: string, address: string): Promise<string> {
    try {
      const session = this.activeSessions.get(sessionId)
      if (!session) {
        throw new Error('Smart Session not found or expired')
      }

      if (Date.now() > session.expiresAt) {
        this.activeSessions.delete(sessionId)
        throw new Error('Smart Session has expired')
      }

      // Use AppKit to get balance
      const network = getNetworkById(chainId)
      if (!network) {
        throw new Error(`Network ${chainId} not supported`)
      }

      // This would use AppKit's balance API
      return '0.0' // Placeholder - implement based on AppKit's balance API
    } catch (error) {
      throw new Error(`Failed to get balance with Smart Session: ${error}`)
    }
  }

  // Revoke Smart Session
  async revokeSession(sessionId: string): Promise<void> {
    try {
      const session = this.activeSessions.get(sessionId)
      if (!session) {
        throw new Error('Smart Session not found')
      }

      // Revoke session in AppKit
      await this.revokeSmartSession(sessionId)

      // Remove from local storage
      this.activeSessions.delete(sessionId)
    } catch (error) {
      throw new Error(`Failed to revoke Smart Session: ${error}`)
    }
  }

  // Get active sessions
  getActiveSessions(): SmartSessionResponse[] {
    return Array.from(this.activeSessions.values())
  }

  // Check if session is active
  isSessionActive(sessionId: string): boolean {
    const session = this.activeSessions.get(sessionId)
    if (!session) return false
    
    return Date.now() <= session.expiresAt
  }

  // Wait for Smart Session approval
  private async waitForSmartSessionApproval(request: SmartSessionRequest): Promise<SmartSessionResponse | null> {
    return new Promise((resolve) => {
      let attempts = 0
      const maxAttempts = 60 // 60 seconds timeout
      
      const checkApproval = () => {
        attempts++
        
        // Check if Smart Session was approved
        if (extendedAppKit.connection && extendedAppKit.connection.address) {
          const sessionResponse: SmartSessionResponse = {
            sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            permissions: request.permissions,
            expiresAt: Date.now() + (request.sessionDuration || 3600) * 1000, // Default 1 hour
            walletAddress: extendedAppKit.connection.address
          }
          
          resolve(sessionResponse)
          return
        }
        
        if (attempts >= maxAttempts) {
          resolve(null)
          return
        }
        
        setTimeout(checkApproval, 1000)
      }
      
      checkApproval()
    })
  }

  // Execute transaction with Smart Session
  private async executeWithSmartSession(
    sessionId: string,
    chainId: string,
    transaction: {
      to: `0x${string}`
      data: `0x${string}`
      value?: `0x${string}`
    }
  ): Promise<string> {
    try {
      // This would use AppKit's Smart Session transaction API
      // For now, return a placeholder transaction hash
      return `0x${Math.random().toString(36).substr(2, 64)}`
    } catch (error) {
      throw new Error(`Smart Session transaction execution failed: ${error}`)
    }
  }

  // Validate contract call against permissions
  private validateContractCall(session: SmartSessionResponse, contractCall: any): void {
    const contractPermissions = session.permissions.filter(p => p.type === 'contract-call')
    
    for (const permission of contractPermissions) {
      if (permission.data?.address === contractCall.to) {
        // Check if function is allowed
        const functionPermissions = permission.data?.functions || []
        const isFunctionAllowed = functionPermissions.some(fp => 
          fp.functionName === contractCall.functionName
        )
        
        if (!isFunctionAllowed) {
          throw new Error(`Function ${contractCall.functionName} not allowed in Smart Session`)
        }
        
        return // Valid contract call
      }
    }
    
    throw new Error('Contract call not allowed in Smart Session')
  }

  // Revoke Smart Session in AppKit
  private async revokeSmartSession(sessionId: string): Promise<void> {
    try {
      // This would use AppKit's Smart Session revocation API
      console.log(`Revoking Smart Session: ${sessionId}`)
    } catch (error) {
      throw new Error(`Failed to revoke Smart Session in AppKit: ${error}`)
    }
  }

  // Create default Smart Session request for atomic swaps
  createAtomicSwapSession(chainId: string, contractAddress: string): SmartSessionRequest {
    return {
      permissions: [
        {
          type: 'contract-call',
          data: {
            address: contractAddress as `0x${string}`,
            abi: [], // Would include actual contract ABI
            functions: [
              {
                functionName: 'deposit',
                valueLimit: '0x0' // No value limit for deposits
              },
              {
                functionName: 'claim',
                valueLimit: '0x0'
              },
              {
                functionName: 'refund',
                valueLimit: '0x0'
              }
            ]
          }
        },
        {
          type: 'transaction',
          data: {}
        },
        {
          type: 'balance',
          data: {}
        }
      ],
      sessionDuration: 3600, // 1 hour
      description: 'Atomic swap session for cross-chain transactions'
    }
  }
}

// Export singleton instance
export const smartSessionService = SmartSessionService.getInstance() 