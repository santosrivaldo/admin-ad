import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

// Mock de usuários administradores (em produção, usar AD/LDAP)
const adminUsers = [
  {
    username: 'admin',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // admin123
    displayName: 'Administrador',
    role: 'admin'
  }
]

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { message: 'Usuário e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar usuário
    const user = adminUsers.find(u => u.username === username)
    
    if (!user) {
      return NextResponse.json(
        { message: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password)
    
    if (!isValidPassword) {
      return NextResponse.json(
        { message: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    // Gerar JWT
    const token = jwt.sign(
      { 
        username: user.username, 
        displayName: user.displayName,
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    )

    return NextResponse.json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        username: user.username,
        displayName: user.displayName,
        role: user.role
      }
    })

  } catch (error) {
    console.error('Erro no login:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
