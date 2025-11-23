import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Calendar, 
  Trophy, 
  Users, 
  Settings, 
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  RefreshCw,
  Check
} from 'lucide-react';

export function AdminPanel() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setIsAdmin(data?.is_admin || false);
    } catch (error) {
      console.error('Erro ao verificar status admin:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>
              Você não tem permissão para acessar o painel administrativo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = '/'}>
              Voltar para Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">Painel Administrativo</h1>
                <p className="text-sm text-muted-foreground">
                  Gerenciamento do Bolão FPT
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              Voltar para o Site
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="rodadas" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="rodadas">
              <Calendar className="h-4 w-4 mr-2" />
              Rodadas
            </TabsTrigger>
            <TabsTrigger value="jogos">
              <Trophy className="h-4 w-4 mr-2" />
              Jogos
            </TabsTrigger>
            <TabsTrigger value="resultados">
              <RefreshCw className="h-4 w-4 mr-2" />
              Resultados
            </TabsTrigger>
            <TabsTrigger value="usuarios">
              <Users className="h-4 w-4 mr-2" />
              Usuários
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rodadas">
            <RoundsManagement />
          </TabsContent>

          <TabsContent value="jogos">
            <MatchesManagement />
          </TabsContent>

          <TabsContent value="resultados">
            <ResultsManagement />
          </TabsContent>

          <TabsContent value="usuarios">
            <UsersManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// ============================================
// GERENCIAMENTO DE RODADAS
// ============================================

function RoundsManagement() {
  const [rounds, setRounds] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRound, setEditingRound] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [roundsRes, compsRes] = await Promise.all([
        supabase
          .from('rounds')
          .select('*, competition:competitions(*)')
          .order('round_number', { ascending: false }),
        supabase
          .from('competitions')
          .select('*')
          .eq('is_active', true)
      ]);

      if (roundsRes.error) throw roundsRes.error;
      if (compsRes.error) throw compsRes.error;

      setRounds(roundsRes.data || []);
      setCompetitions(compsRes.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir esta rodada?')) return;

    try {
      const { error } = await supabase
        .from('rounds')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('✅ Rodada excluída com sucesso!');
      loadData();
    } catch (error) {
      console.error('Erro ao excluir rodada:', error);
      alert('❌ Erro ao excluir rodada: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gerenciar Rodadas</h2>
        <Button onClick={() => { setEditingRound(null); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Rodada
        </Button>
      </div>

      {showForm && (
        <RoundForm
          round={editingRound}
          competitions={competitions}
          onClose={() => { setShowForm(false); setEditingRound(null); }}
          onSave={() => { setShowForm(false); setEditingRound(null); loadData(); }}
        />
      )}

      <div className="grid gap-4">
        {rounds.map((round) => (
          <Card key={round.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{round.name}</CardTitle>
                  <CardDescription>
                    {round.competition?.name} - Rodada #{round.round_number}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setEditingRound(round); setShowForm(true); }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(round.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className="font-medium capitalize">{round.status}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Início</p>
                  <p className="font-medium">
                    {new Date(round.start_date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Fim</p>
                  <p className="font-medium">
                    {new Date(round.end_date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Valor</p>
                  <p className="font-medium">R$ {round.ticket_price?.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function RoundForm({ round, competitions, onClose, onSave }) {
  const [formData, setFormData] = useState({
    competition_id: round?.competition_id || (competitions[0]?.id || ''),
    round_number: round?.round_number || 1,
    name: round?.name || '',
    start_date: round?.start_date?.split('T')[0] || '',
    end_date: round?.end_date?.split('T')[0] || '',
    bets_deadline: round?.bets_deadline?.split('T')[0] || '',
    ticket_price: round?.ticket_price || 10.00,
    status: round?.status || 'upcoming'
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = {
        ...formData,
        ticket_price: parseFloat(formData.ticket_price),
        round_number: parseInt(formData.round_number)
      };

      if (round) {
        const { error } = await supabase
          .from('rounds')
          .update(data)
          .eq('id', round.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('rounds')
          .insert(data);
        if (error) throw error;
      }

      alert(`✅ Rodada ${round ? 'atualizada' : 'criada'} com sucesso!`);
      onSave();
    } catch (error) {
      console.error('Erro ao salvar rodada:', error);
      alert('❌ Erro: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{round ? 'Editar Rodada' : 'Nova Rodada'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Competição</label>
              <select
                value={formData.competition_id}
                onChange={(e) => setFormData({...formData, competition_id: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                required
              >
                {competitions.map(comp => (
                  <option key={comp.id} value={comp.id}>{comp.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Número da Rodada</label>
              <input
                type="number"
                value={formData.round_number}
                onChange={(e) => setFormData({...formData, round_number: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                required
                min="1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Nome</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Ex: Rodada 1"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Data Início</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Data Fim</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Prazo Palpites</label>
              <input
                type="date"
                value={formData.bets_deadline}
                onChange={(e) => setFormData({...formData, bets_deadline: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Valor da Cartela (R$)</label>
              <input
                type="number"
                step="0.01"
                value={formData.ticket_price}
                onChange={(e) => setFormData({...formData, ticket_price: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                required
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                required
              >
                <option value="upcoming">Próxima</option>
                <option value="active">Ativa</option>
                <option value="finished">Finalizada</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" onClick={onClose} variant="outline" disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ============================================
// GERENCIAMENTO DE JOGOS
// ============================================

function MatchesManagement() {
  const [rounds, setRounds] = useState([]);
  const [selectedRound, setSelectedRound] = useState(null);
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);

  useEffect(() => {
    loadRounds();
    loadTeams();
  }, []);

  useEffect(() => {
    if (selectedRound) {
      loadMatches(selectedRound);
    }
  }, [selectedRound]);

  const loadRounds = async () => {
    try {
      const { data, error } = await supabase
        .from('rounds')
        .select('*')
        .order('round_number', { ascending: false });

      if (error) throw error;
      setRounds(data || []);
      if (data && data.length > 0) {
        setSelectedRound(data[0].id);
      }
    } catch (error) {
      console.error('Erro ao carregar rodadas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('name');

      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      console.error('Erro ao carregar times:', error);
    }
  };

  const loadMatches = async (roundId) => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          home_team:teams!matches_home_team_id_fkey(*),
          away_team:teams!matches_away_team_id_fkey(*)
        `)
        .eq('round_id', roundId)
        .order('scheduled_at');

      if (error) throw error;
      setMatches(data || []);
    } catch (error) {
      console.error('Erro ao carregar jogos:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este jogo?')) return;

    try {
      const { error } = await supabase
        .from('matches')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('✅ Jogo excluído com sucesso!');
      loadMatches(selectedRound);
    } catch (error) {
      console.error('Erro ao excluir jogo:', error);
      alert('❌ Erro ao excluir jogo: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Gerenciar Jogos</h2>
          <select
            value={selectedRound || ''}
            onChange={(e) => setSelectedRound(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            {rounds.map(round => (
              <option key={round.id} value={round.id}>
                {round.name}
              </option>
            ))}
          </select>
        </div>
        <Button onClick={() => { setEditingMatch(null); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Jogo
        </Button>
      </div>

      {showForm && (
        <MatchForm
          match={editingMatch}
          roundId={selectedRound}
          teams={teams}
          onClose={() => { setShowForm(false); setEditingMatch(null); }}
          onSave={() => { setShowForm(false); setEditingMatch(null); loadMatches(selectedRound); }}
        />
      )}

      <div className="grid gap-4">
        {matches.map((match) => (
          <Card key={match.id}>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <div className="text-right flex-1">
                      <p className="font-bold">{match.home_team?.short_name || match.home_team?.name}</p>
                    </div>
                    <div className="text-center px-4">
                      <p className="text-2xl font-bold">VS</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(match.scheduled_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold">{match.away_team?.short_name || match.away_team?.name}</p>
                    </div>
                  </div>
                  {match.status === 'finished' && (
                    <div className="text-center mt-2">
                      <p className="text-sm text-muted-foreground">
                        Placar: {match.home_score} x {match.away_score}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setEditingMatch(match); setShowForm(true); }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(match.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {matches.length === 0 && (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                Nenhum jogo cadastrado nesta rodada
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function MatchForm({ match, roundId, teams, onClose, onSave }) {
  const [formData, setFormData] = useState({
    round_id: roundId,
    home_team_id: match?.home_team_id || (teams[0]?.id || ''),
    away_team_id: match?.away_team_id || (teams[1]?.id || ''),
    scheduled_at: match?.scheduled_at?.split('T')[0] || '',
    scheduled_time: match?.scheduled_at ? new Date(match.scheduled_at).toTimeString().slice(0, 5) : '19:00',
    status: match?.status || 'scheduled'
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const scheduledAt = `${formData.scheduled_at}T${formData.scheduled_time}:00`;
      
      const data = {
        round_id: formData.round_id,
        home_team_id: formData.home_team_id,
        away_team_id: formData.away_team_id,
        scheduled_at: scheduledAt,
        status: formData.status
      };

      if (match) {
        const { error } = await supabase
          .from('matches')
          .update(data)
          .eq('id', match.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('matches')
          .insert(data);
        if (error) throw error;
      }

      alert(`✅ Jogo ${match ? 'atualizado' : 'criado'} com sucesso!`);
      onSave();
    } catch (error) {
      console.error('Erro ao salvar jogo:', error);
      alert('❌ Erro: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{match ? 'Editar Jogo' : 'Novo Jogo'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Time Casa</label>
              <select
                value={formData.home_team_id}
                onChange={(e) => setFormData({...formData, home_team_id: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                required
              >
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Time Fora</label>
              <select
                value={formData.away_team_id}
                onChange={(e) => setFormData({...formData, away_team_id: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                required
              >
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Data</label>
              <input
                type="date"
                value={formData.scheduled_at}
                onChange={(e) => setFormData({...formData, scheduled_at: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Horário</label>
              <input
                type="time"
                value={formData.scheduled_time}
                onChange={(e) => setFormData({...formData, scheduled_time: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                required
              >
                <option value="scheduled">Agendado</option>
                <option value="live">Ao Vivo</option>
                <option value="finished">Finalizado</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" onClick={onClose} variant="outline" disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ============================================
// GERENCIAMENTO DE RESULTADOS
// ============================================

function ResultsManagement() {
  const [rounds, setRounds] = useState([]);
  const [selectedRound, setSelectedRound] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadRounds();
  }, []);

  useEffect(() => {
    if (selectedRound) {
      loadMatches(selectedRound);
    }
  }, [selectedRound]);

  const loadRounds = async () => {
    try {
      const { data, error } = await supabase
        .from('rounds')
        .select('*')
        .in('status', ['active', 'finished'])
        .order('round_number', { ascending: false });

      if (error) throw error;
      setRounds(data || []);
      if (data && data.length > 0) {
        setSelectedRound(data[0].id);
      }
    } catch (error) {
      console.error('Erro ao carregar rodadas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMatches = async (roundId) => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          home_team:teams!matches_home_team_id_fkey(*),
          away_team:teams!matches_away_team_id_fkey(*)
        `)
        .eq('round_id', roundId)
        .order('scheduled_at');

      if (error) throw error;
      setMatches(data || []);
    } catch (error) {
      console.error('Erro ao carregar jogos:', error);
    }
  };

  const updateResult = async (matchId, homeScore, awayScore) => {
    try {
      const { error } = await supabase
        .from('matches')
        .update({
          home_score: parseInt(homeScore),
          away_score: parseInt(awayScore),
          status: 'finished'
        })
        .eq('id', matchId);

      if (error) throw error;
      
      // Recarregar jogos
      loadMatches(selectedRound);
      
      // Calcular pontuação
      await calculateScores(matchId);
      
      alert('✅ Resultado atualizado e pontuação calculada!');
    } catch (error) {
      console.error('Erro ao atualizar resultado:', error);
      alert('❌ Erro: ' + error.message);
    }
  };

  const calculateScores = async (matchId) => {
    try {
      // Buscar o jogo com resultado
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .single();

      if (matchError) throw matchError;

      // Buscar todos os palpites deste jogo
      const { data: bets, error: betsError } = await supabase
        .from('bets')
        .select('*')
        .eq('match_id', matchId);

      if (betsError) throw betsError;

      // Calcular pontos para cada palpite
      for (const bet of bets) {
        let points = 0;

        // Regra de pontuação:
        // - Acertou o resultado exato: 5 pontos
        // - Acertou o vencedor: 3 pontos
        // - Errou tudo: 0 pontos

        const actualResult = match.home_score > match.away_score ? 'home' : 
                           match.home_score < match.away_score ? 'away' : 'draw';

        if (bet.predicted_result === actualResult) {
          points = 3; // Acertou o vencedor
          
          // Verificar se acertou o placar exato
          if (bet.predicted_home_score === match.home_score && 
              bet.predicted_away_score === match.away_score) {
            points = 5; // Acertou o placar exato
          }
        }

        // Atualizar pontos do palpite
        await supabase
          .from('bets')
          .update({ points })
          .eq('id', bet.id);
      }

      console.log(`Pontuação calculada para ${bets.length} palpites`);
    } catch (error) {
      console.error('Erro ao calcular pontuação:', error);
    }
  };

  const autoUpdateResults = async () => {
    setUpdating(true);
    try {
      // Aqui seria a integração com API externa
      // Por enquanto, apenas simular
      alert('⚠️ Integração com API externa em desenvolvimento.\n\nPor enquanto, use a edição manual de resultados.');
    } catch (error) {
      console.error('Erro ao atualizar resultados:', error);
      alert('❌ Erro: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Inserir Resultados</h2>
          <select
            value={selectedRound || ''}
            onChange={(e) => setSelectedRound(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            {rounds.map(round => (
              <option key={round.id} value={round.id}>
                {round.name}
              </option>
            ))}
          </select>
        </div>
        <Button onClick={autoUpdateResults} disabled={updating}>
          <RefreshCw className={`h-4 w-4 mr-2 ${updating ? 'animate-spin' : ''}`} />
          Buscar Resultados Automaticamente
        </Button>
      </div>

      <div className="grid gap-4">
        {matches.map((match) => (
          <ResultCard
            key={match.id}
            match={match}
            onUpdate={updateResult}
          />
        ))}
        {matches.length === 0 && (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                Nenhum jogo encontrado nesta rodada
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function ResultCard({ match, onUpdate }) {
  const [homeScore, setHomeScore] = useState(match.home_score || 0);
  const [awayScore, setAwayScore] = useState(match.away_score || 0);
  const [editing, setEditing] = useState(false);

  const handleSave = () => {
    onUpdate(match.id, homeScore, awayScore);
    setEditing(false);
  };

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <div className="text-right flex-1">
                <p className="font-bold text-lg">{match.home_team?.short_name || match.home_team?.name}</p>
              </div>
              
              {editing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={homeScore}
                    onChange={(e) => setHomeScore(e.target.value)}
                    className="w-16 px-2 py-1 border rounded text-center"
                    min="0"
                  />
                  <span className="text-xl font-bold">X</span>
                  <input
                    type="number"
                    value={awayScore}
                    onChange={(e) => setAwayScore(e.target.value)}
                    className="w-16 px-2 py-1 border rounded text-center"
                    min="0"
                  />
                </div>
              ) : (
                <div className="text-center px-4">
                  {match.status === 'finished' ? (
                    <p className="text-3xl font-bold">
                      {match.home_score} - {match.away_score}
                    </p>
                  ) : (
                    <p className="text-2xl font-bold text-muted-foreground">VS</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(match.scheduled_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              )}
              
              <div className="flex-1">
                <p className="font-bold text-lg">{match.away_team?.short_name || match.away_team?.name}</p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 ml-4">
            {editing ? (
              <>
                <Button size="sm" onClick={handleSave}>
                  <Check className="h-4 w-4 mr-1" />
                  Salvar
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={() => setEditing(true)}>
                <Edit className="h-4 w-4 mr-1" />
                {match.status === 'finished' ? 'Editar' : 'Inserir'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// GERENCIAMENTO DE USUÁRIOS
// ============================================

function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadUsers();
    loadStats();
  }, []);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          tickets:tickets(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      const { count: totalTickets } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true });

      setStats({ totalUsers, totalTickets });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const toggleAdmin = async (userId, currentStatus) => {
    if (!confirm(`Tem certeza que deseja ${currentStatus ? 'remover' : 'conceder'} permissões de admin?`)) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({ is_admin: !currentStatus })
        .eq('id', userId);

      if (error) throw error;
      alert('✅ Permissões atualizadas!');
      loadUsers();
    } catch (error) {
      console.error('Erro ao atualizar permissões:', error);
      alert('❌ Erro: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Gerenciar Usuários</h2>

      {stats && (
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="py-4">
              <p className="text-sm text-muted-foreground">Total de Usuários</p>
              <p className="text-3xl font-bold">{stats.totalUsers}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <p className="text-sm text-muted-foreground">Total de Cartelas</p>
              <p className="text-3xl font-bold">{stats.totalTickets}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="text-left p-4">Nome</th>
                  <th className="text-left p-4">Email</th>
                  <th className="text-left p-4">Cartelas</th>
                  <th className="text-left p-4">Admin</th>
                  <th className="text-left p-4">Cadastro</th>
                  <th className="text-left p-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">{user.name}</td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4">{user.tickets?.[0]?.count || 0}</td>
                    <td className="p-4">
                      {user.is_admin ? (
                        <span className="px-2 py-1 bg-primary text-primary-foreground rounded text-xs">Admin</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleAdmin(user.id, user.is_admin)}
                      >
                        {user.is_admin ? 'Remover Admin' : 'Tornar Admin'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

