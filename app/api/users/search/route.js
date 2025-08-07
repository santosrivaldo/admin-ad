import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Mock de usuários do AD (em produção, usar LDAP)
const mockUsers = [
  {
    samAccountName: 'jsilva',
    displayName: 'João Silva',
    userPrincipalName: 'jsilva@empresa.com',
    enabled: true,
    groups: ['Domain Users', 'Vendas', 'VPN Users'],
    department: 'Vendas',
    lastLogon: '2024-01-15T10:30:00Z'
  },
  {
    samAccountName: 'mferreira',
    displayName: 'Maria Ferreira',
    userPrincipalName: 'mferreira@empresa.com',
    enabled: true,
    groups: ['Domain Users', 'TI', 'Administrators'],
    department: 'TI',
    lastLogon: '2024-01-15T14:20:00Z'
  },
  {
    samAccountName: 'psantos',
    displayName: 'Pedro Santos',
    userPrincipalName: 'psantos@empresa.com',
    enabled: false,
    groups: ['Domain Users', 'RH'],
    department: 'RH',
    lastLogon: '2024-01-10T09:15:00Z'
  }
]

function verifyToken(request) {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Token não fornecido')
  }

  const token = authHeader.substring(7)
  return jwt.verify(token, JWT_SECRET)
}

export async function GET(request) {
  try {
    // Verificar autenticação
    const decoded = verifyToken(request)
    
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json(
        { message: 'Parâmetro de busca é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar usuário (em produção, usar LDAP)
    const user = mockUsers.find(u => 
      u.samAccountName.toLowerCase().includes(query.toLowerCase()) ||
      u.displayName.toLowerCase().includes(query.toLowerCase())
    )

    if (!user) {
      return NextResponse.json(
        { message: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })

  } catch (error) {
    console.error('Erro na busca:', error)
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { message: 'Token inválido' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
