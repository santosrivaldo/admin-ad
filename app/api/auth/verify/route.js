import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { valid: false, message: 'Token não fornecido' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)

    try {
      const decoded = jwt.verify(token, JWT_SECRET)
      
      return NextResponse.json({
        valid: true,
        user: {
          username: decoded.username,
          displayName: decoded.displayName,
          role: decoded.role
        }
      })
    } catch (jwtError) {
      return NextResponse.json(
        { valid: false, message: 'Token inválido' },
        { status: 401 }
      )
    }

  } catch (error) {
    console.error('Erro na verificação:', error)
    return NextResponse.json(
      { valid: false, message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
