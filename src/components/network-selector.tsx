'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  useAppKitAccount,
  useAppKitNetwork
} from '@reown/appkit/react'
import { NETWORK_CONFIGS, NetworkConfig } from '@/lib/network-config'
import { motion, AnimatePresence } from 'framer-motion'

interface NetworkSelectorProps {
  onNetworkSelect?: (network: NetworkConfig) => void
  showTestnets?: boolean
  className?: string
}

export function NetworkSelector({ 
  onNetworkSelect, 
  showTestnets = true,
  className = ""
}: NetworkSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const { caipNetwork } = useAppKitNetwork()

  const categories = [
    { id: 'all', name: 'All Networks', icon: '🌐' },
    { id: 'evm', name: 'EVM Chains', icon: '🔷' },
    { id: 'solana', name: 'Solana', icon: '🟣' },
    { id: 'bitcoin', name: 'Bitcoin', icon: '🟠' },
    { id: 'near', name: 'NEAR', icon: '🟢' },
    { id: 'algorand', name: 'Algorand', icon: '🟡' }
  ]

  const filteredNetworks = NETWORK_CONFIGS.filter(network => {
    const categoryMatch = selectedCategory === 'all' || network.category === selectedCategory
    const testnetMatch = showTestnets || !network.isTestnet
    return categoryMatch && testnetMatch
  })

  const getCurrentNetwork = (): NetworkConfig | null => {
    if (!caipNetwork) return null
    
    const network = NETWORK_CONFIGS.find(n => 
      n.id === caipNetwork.id || n.name === caipNetwork.name
    )
    
    return network || null
  }

  const currentNetwork = getCurrentNetwork()

  const handleNetworkSelect = async (network: NetworkConfig) => {
    try {
      // Network switching will be handled by AppKitNetworkButton
      onNetworkSelect?.(network)
      setIsOpen(false)
    } catch (error) {
      console.error('Failed to switch network:', error)
    }
  }

  const getNetworkStatusColor = (network: NetworkConfig) => {
    if (currentNetwork?.id === network.id) return 'bg-green-500'
    return 'bg-gray-400'
  }

  return (
    <div className={`relative ${className}`}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="neutral-secondary"
        className="w-full justify-between bg-black/20 border-white/20 text-white hover:bg-white/10"
      >
        <div className="flex items-center gap-2">
          {currentNetwork ? (
            <>
              <span>{currentNetwork.icon}</span>
              <span>{currentNetwork.name}</span>
              {currentNetwork.isTestnet && (
                <Badge variant="secondary" className="text-xs">
                  Testnet
                </Badge>
              )}
            </>
          ) : (
            <>
              <span>🌐</span>
              <span>Select Network</span>
            </>
          )}
        </div>
        <span className="text-gray-400">▼</span>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 z-50"
          >
            <Card className="bg-black/90 border-white/20 backdrop-blur-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg">Select Network</CardTitle>
                
                {/* Category Filter */}
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      variant={selectedCategory === category.id ? "default" : "neutral-secondary"}
                      size="sm"
                      className={`text-xs ${
                        selectedCategory === category.id 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-black/30 border-white/20 text-white hover:bg-white/10'
                      }`}
                    >
                      <span className="mr-1">{category.icon}</span>
                      {category.name}
                    </Button>
                  ))}
                </div>
              </CardHeader>

              <CardContent className="max-h-96 overflow-y-auto space-y-2">
                {filteredNetworks.map((network) => (
                  <motion.div
                    key={network.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={() => handleNetworkSelect(network)}
                      variant="neutral-secondary"
                      className={`w-full justify-start p-3 h-auto ${
                        currentNetwork?.id === network.id
                          ? 'bg-purple-600/20 border-purple-500/30'
                          : 'bg-black/30 border-white/10 hover:bg-white/10'
                      } border rounded-lg`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${getNetworkStatusColor(network)}`} />
                            <span className="text-xl">{network.icon}</span>
                          </div>
                          <div className="text-left">
                            <div className="flex items-center gap-2">
                              <span className="text-white font-medium">
                                {network.name}
                              </span>
                              {network.isTestnet && (
                                <Badge variant="secondary" className="text-xs">
                                  Testnet
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-gray-400">
                              {network.symbol} • {network.category.toUpperCase()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {currentNetwork?.id === network.id && (
                            <Badge variant="default" className="bg-green-600 text-xs">
                              Connected
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Button>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

// Quick Network Switcher Component
export function QuickNetworkSwitcher() {
  const { caipNetwork } = useAppKitNetwork()
  
  const popularNetworks = NETWORK_CONFIGS.filter(network => 
    [1, 137, 42161, 8453, 10, 56, 43114, 250].includes(Number(network.id)) || 
    ['solana-mainnet', 'bitcoin-mainnet', 'near-mainnet', 'algorand-mainnet'].includes(String(network.id))
  )

  const getCurrentNetwork = (): NetworkConfig | null => {
    if (!caipNetwork) return null
    
    const network = NETWORK_CONFIGS.find(n => 
      n.id === caipNetwork.id || n.name === caipNetwork.name
    )
    
    return network || null
  }

  const currentNetwork = getCurrentNetwork()

  return (
    <div className="flex flex-wrap gap-2">
      {popularNetworks.map((network) => (
        <Button
          key={network.id}
          onClick={() => {
            // Network switching will be handled by AppKitNetworkButton
            console.log(`Switching to ${network.name}`)
          }}
          variant={currentNetwork?.id === network.id ? "default" : "neutral-secondary"}
          size="sm"
          className={`text-xs ${
            currentNetwork?.id === network.id 
              ? 'bg-purple-600 text-white' 
              : 'bg-black/30 border-white/20 text-white hover:bg-white/10'
          }`}
        >
          <span className="mr-1">{network.icon}</span>
          {network.name}
        </Button>
      ))}
    </div>
  )
} 