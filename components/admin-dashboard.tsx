'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Search, LogOut, User, UserX, Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react'

interface User {
  samAccountName: string
  displayName: string
  userPrincipalName: string
  enabled: boolean
  groups: string[]
  lastLogon?: string
  department?: string
}

interface AdminDashboardProps {
  user: any
  onLogout: () => void
}

export function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResult, setSearchResult] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [auditLogs, setAuditLogs] = useState<any[]>([])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchTerm.trim()) return

    setLoading(true)
    setError('')
    setSearchResult(null)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchTerm)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (response.ok) {
        setSearchResult(data.user)
      } else {
        setError(data.message || 'Usuário não encontrado')
      }
    } catch (err) {
      setError('Erro de conexão com o servidor')
    } finally {
      setLoading(false)
    }
  }

  const handleDisableUser = async () => {
    if (!searchResult) return

    const confirmed = window.confirm(
      `Tem certeza que deseja desativar o usuário ${searchResult.displayName} (${searchResult.samAccountName})?`
    )

    if (!confirmed) return

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/users/disable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ samAccountName: searchResult.samAccountName })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(`Usuário ${searchResult.displayName} foi desativado com sucesso`)
        setSearchResult({ ...searchResult, enabled: false })
        loadAuditLogs()
      } else {
        setError(data.message || 'Erro ao desativar usuário')
      }
    } catch (err) {
      setError('Erro de conexão com o servidor')
    } finally {
      setLoading(false)
    }
  }

  const loadAuditLogs = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/audit/logs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setAuditLogs(data.logs)
      }
    } catch (err) {
      console.error('Erro ao carregar logs:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">AD Admin System</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Olá, {user.displayName}</span>
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Search Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Search className="h-5 w-5 mr-2" />
                  Buscar Usuário
                </CardTitle>
                <CardDescription>
                  Digite o samAccountName ou nome completo do usuário
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Ex: jsilva ou João Silva"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Buscando...' : 'Buscar'}
                    </Button>
                  </div>
                </form>

                {error && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="mt-4 border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">{success}</AlertDescription>
                  </Alert>
                )}

                {/* User Details */}
                {searchResult && (
                  <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold flex items-center">
                        <User className="h-5 w-5 mr-2" />
                        Informações do Usuário
                      </h3>
                      <Badge variant={searchResult.enabled ? "default" : "destructive"}>
                        {searchResult.enabled ? 'Ativo' : 'Desativado'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Nome Completo</Label>
                        <p className="text-sm text-gray-900">{searchResult.displayName}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">samAccountName</Label>
                        <p className="text-sm text-gray-900">{searchResult.samAccountName}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">UPN</Label>
                        <p className="text-sm text-gray-900">{searchResult.userPrincipalName}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Departamento</Label>
                        <p className="text-sm text-gray-900">{searchResult.department || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <Label className="text-sm font-medium text-gray-600">Grupos</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {searchResult.groups.map((group, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {group}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {searchResult.enabled && (
                      <div className="flex justify-end">
                        <Button 
                          variant="destructive" 
                          onClick={handleDisableUser}
                          disabled={loading}
                        >
                          <UserX className="h-4 w-4 mr-2" />
                          Desativar Usuário
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Audit Logs */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Logs de Auditoria
                </CardTitle>
                <CardDescription>
                  Últimas ações realizadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={loadAuditLogs}
                  className="mb-4 w-full"
                >
                  Carregar Logs
                </Button>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {auditLogs.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Nenhum log encontrado
                    </p>
                  ) : (
                    auditLogs.map((log, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg text-sm">
                        <div className="font-medium text-gray-900">{log.action}</div>
                        <div className="text-gray-600">Usuário: {log.targetUser}</div>
                        <div className="text-gray-600">Por: {log.adminUser}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(log.timestamp).toLocaleString('pt-BR')}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
