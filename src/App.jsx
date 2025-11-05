import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Trophy, Target, TrendingUp, Calendar } from 'lucide-react'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('rounds')
  const [rounds, setRounds] = useState([])
  const [matches, setMatches] = useState([])
  const [ranking, setRanking] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      // Buscar rodadas
      const { data: roundsData } = await supabase
        .from('rounds')
        .select('*')
        .order('round_number')
        .limit(5)

      setRounds(roundsData || [])

      // Buscar jogos da primeira rodada
      if (roundsData && roundsData.length > 0) {
        const { data: matchesData } = await supabase
          .from('matches')
          .select(`
            *,
            home_team:teams!matches_home_team_id_fkey(name, short_name, logo_url),
            away_team:teams!matches_away_team_id_fkey(name, short_name, logo_url)
          `)
          .eq('round_id', roundsData[0].id)
          .order('scheduled_at')

        setMatches(matchesData || [])
      }

      // Buscar ranking (simulado)
      setRanking([
        { position: 1, name: 'João Silva', points: 85, rounds_won: 3 },
        { position: 2, name: 'Maria Santos', points: 78, rounds_won: 2 },
        { position: 3, name: 'Pedro Costa', points: 72, rounds_won: 2 },
        { position: 4, name: 'Ana Lima', points: 68, rounds_won: 1 },
        { position: 5, name: 'Carlos Souza', points: 65, rounds_won: 1 },
      ])

      setLoading(false)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      setLoading(false)
    }
  }

  async function handleLogin(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert('Erro ao fazer login: ' + error.message)
    } else {
      setUser(data.user)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <Trophy className="w-16 h-16 text-green-600 mx-auto mb-4 animate-bounce" />
          <p className="text-xl text-green-800">Carregando Bolão FPT...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-green-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-green-600" />
              <div>
                <h1 className="text-2xl font-bold text-green-800">Bolão FPT</h1>
                <p className="text-sm text-green-600">Futebol Palpite Total</p>
              </div>
            </div>
            <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
              Entrar
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-green-200 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Meus Pontos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-800">85</div>
              <p className="text-xs text-green-600 mt-1">3º lugar no ranking</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Rodadas Vencidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-800">3</div>
              <p className="text-xs text-green-600 mt-1">de 5 disputadas</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Taxa de Acerto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-800">68%</div>
              <p className="text-xs text-green-600 mt-1">34 de 50 palpites</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white border border-green-200">
            <TabsTrigger value="rounds" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
              Rodadas
            </TabsTrigger>
            <TabsTrigger value="ranking" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
              Ranking
            </TabsTrigger>
            <TabsTrigger value="bets" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
              Meus Palpites
            </TabsTrigger>
          </TabsList>

          {/* Rodadas Tab */}
          <TabsContent value="rounds" className="space-y-4">
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <Calendar className="w-5 h-5" />
                  Rodada 1 - Brasileirão 2025
                </CardTitle>
                <CardDescription>
                  Prazo para palpites: 29/03/2025 às 15:00
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {matches.length > 0 ? (
                  matches.map((match) => (
                    <div key={match.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="text-center flex-1">
                          <p className="font-semibold text-green-800">{match.home_team?.short_name || 'Time'}</p>
                          <p className="text-xs text-green-600">{match.home_team?.name}</p>
                        </div>
                        <div className="text-center px-4">
                          <p className="text-sm text-green-600">vs</p>
                          <p className="text-xs text-green-500">
                            {new Date(match.scheduled_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                          </p>
                        </div>
                        <div className="text-center flex-1">
                          <p className="font-semibold text-green-800">{match.away_team?.short_name || 'Time'}</p>
                          <p className="text-xs text-green-600">{match.away_team?.name}</p>
                        </div>
                      </div>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        Palpitar
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-green-600 py-8">Nenhum jogo disponível</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ranking Tab */}
          <TabsContent value="ranking">
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800">Ranking Geral</CardTitle>
                <CardDescription>Classificação dos participantes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {ranking.map((player) => (
                    <div key={player.position} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          player.position === 1 ? 'bg-yellow-400 text-yellow-900' :
                          player.position === 2 ? 'bg-gray-300 text-gray-700' :
                          player.position === 3 ? 'bg-orange-400 text-orange-900' :
                          'bg-green-200 text-green-800'
                        }`}>
                          {player.position}
                        </div>
                        <div>
                          <p className="font-semibold text-green-800">{player.name}</p>
                          <p className="text-xs text-green-600">{player.rounds_won} rodadas vencidas</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-green-600 text-white">
                        {player.points} pts
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Meus Palpites Tab */}
          <TabsContent value="bets">
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800">Meus Palpites</CardTitle>
                <CardDescription>Histórico de palpites realizados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-green-600">
                  <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Você ainda não fez nenhum palpite</p>
                  <p className="text-sm mt-2">Acesse a aba "Rodadas" para começar!</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-green-200 mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-green-600 text-sm">
          <p>© 2025 Bolão FPT - Futebol Palpite Total</p>
          <p className="mt-1">Campeonato Brasileiro Série A</p>
        </div>
      </footer>
    </div>
  )
}

export default App

