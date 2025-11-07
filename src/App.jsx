import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Trophy, Calendar, Users, TrendingUp } from 'lucide-react';

// ============================================
// HOOKS CUSTOMIZADOS
// ============================================

function useRounds() {
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRounds();
  }, []);

  async function fetchRounds() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('rounds')
        .select(`
          *,
          competition:competitions(id, name, slug, year)
        `)
        .order('round_number', { ascending: true });

      if (error) throw error;
      setRounds(data || []);
    } catch (err) {
      console.error('Erro ao buscar rodadas:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { rounds, loading, error, refetch: fetchRounds };
}

function useCurrentRound() {
  const [currentRound, setCurrentRound] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentRound();
  }, []);

  async function fetchCurrentRound() {
    try {
      setLoading(true);
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('rounds')
        .select(`*, competition:competitions(*)`)
        .eq('status', 'active')
        .order('start_date', { ascending: true })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setCurrentRound(data);
    } catch (err) {
      console.error('Erro ao buscar rodada atual:', err);
    } finally {
      setLoading(false);
    }
  }

  return { currentRound, loading, refetch: fetchCurrentRound };
}

function useRoundMatches(roundId) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (roundId) {
      fetchMatches();
    }
  }, [roundId]);

  async function fetchMatches() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('round_matches')
        .select(`
          *,
          match:matches(
            id,
            home_team_id,
            away_team_id,
            home_score,
            away_score,
            match_date,
            status,
            home_team:teams!matches_home_team_id_fkey(id, name, short_name),
            away_team:teams!matches_away_team_id_fkey(id, name, short_name)
          )
        `)
        .eq('round_id', roundId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMatches(data || []);
    } catch (err) {
      console.error('Erro ao buscar jogos:', err);
    } finally {
      setLoading(false);
    }
  }

  return { matches, loading, refetch: fetchMatches };
}

function useRanking() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRanking();
  }, []);

  async function fetchRanking() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('total_points', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRanking(data || []);
    } catch (err) {
      console.error('Erro ao buscar ranking:', err);
    } finally {
      setLoading(false);
    }
  }

  return { ranking, loading, refetch: fetchRanking };
}

// ============================================
// COMPONENTES
// ============================================

function CurrentRound() {
  const { currentRound, loading } = useCurrentRound();
  const { matches, loading: loadingMatches } = useRoundMatches(currentRound?.id);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentRound) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          <p>Nenhuma rodada ativa no momento</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="bg-primary text-primary-foreground">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">{currentRound.name}</CardTitle>
            <CardDescription className="text-primary-foreground/80">
              {currentRound.competition?.name} {currentRound.competition?.year}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {currentRound.status === 'active' ? 'Aberta' : 'Próxima'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid gap-4 md:grid-cols-2 mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Prazo para palpites</p>
              <p className="font-semibold">
                {new Date(currentRound.bets_deadline).toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Valor da cartela</p>
              <p className="font-semibold">R$ {currentRound.ticket_price?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Jogos da Rodada
          </h3>
          
          {loadingMatches ? (
            <div className="text-center py-4 text-muted-foreground">
              Carregando jogos...
            </div>
          ) : matches.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground mb-2">Nenhum jogo cadastrado ainda</p>
              <p className="text-sm text-muted-foreground">
                Os jogos serão adicionados em breve
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {matches.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-4 hover:bg-accent transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <span className="font-semibold">
                        {item.match?.home_team?.short_name || item.match?.home_team?.name || 'Time Casa'}
                      </span>
                      <span className="text-muted-foreground text-sm">vs</span>
                      <span className="font-semibold">
                        {item.match?.away_team?.short_name || item.match?.away_team?.name || 'Time Fora'}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {item.match?.match_date 
                        ? new Date(item.match.match_date).toLocaleDateString('pt-BR')
                        : 'Data a definir'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button className="w-full mt-6" size="lg">
          Fazer Palpites
        </Button>
      </CardContent>
    </Card>
  );
}

function RankingTable() {
  const { ranking, loading } = useRanking();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (ranking.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Nenhum participante ainda</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {ranking.map((user, index) => (
        <div
          key={user.id}
          className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent transition-colors"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold">
            {index + 1}
          </div>
          <div className="flex-1">
            <p className="font-semibold">{user.name || user.email || 'Usuário'}</p>
            <p className="text-sm text-muted-foreground">
              {user.rounds_won || 0} rodadas vencidas
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{user.total_points || 0}</p>
            <p className="text-xs text-muted-foreground">pontos</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function AllRounds() {
  const { rounds, loading } = useRounds();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (rounds.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Nenhuma rodada cadastrada</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {rounds.map((round) => (
        <Card key={round.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{round.name}</CardTitle>
              <Badge variant={
                round.status === 'active' ? 'default' :
                round.status === 'closed' ? 'secondary' :
                'outline'
              }>
                {round.status === 'active' ? 'Aberta' :
                 round.status === 'closed' ? 'Encerrada' :
                 'Próxima'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rodada</span>
                <span className="font-semibold">#{round.round_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Início</span>
                <span>{new Date(round.start_date).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Prazo</span>
                <span>{new Date(round.bets_deadline).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valor</span>
                <span className="font-semibold text-primary">
                  R$ {round.ticket_price?.toFixed(2) || '0.00'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ============================================
// APP PRINCIPAL
// ============================================

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">Bolão FPT</h1>
                <p className="text-sm text-muted-foreground">
                  Futebol, Palpites e Troféus
                </p>
              </div>
            </div>
            <Button>Entrar</Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="rodada" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="rodada">Rodada Atual</TabsTrigger>
            <TabsTrigger value="ranking">Ranking</TabsTrigger>
            <TabsTrigger value="rodadas">Todas as Rodadas</TabsTrigger>
          </TabsList>

          <TabsContent value="rodada" className="space-y-4">
            <CurrentRound />
          </TabsContent>

          <TabsContent value="ranking" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-6 w-6" />
                  Ranking Geral
                </CardTitle>
                <CardDescription>
                  Classificação dos participantes por pontuação total
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RankingTable />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rodadas" className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold mb-4">Todas as Rodadas</h2>
              <AllRounds />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>Bolão FPT © 2025 - Todos os direitos reservados</p>
        </div>
      </footer>
    </div>
  );
}

