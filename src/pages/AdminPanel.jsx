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
  X
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>Você precisa estar logado para acessar esta página.</CardDescription>
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

  if (!isAdmin) {
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
            <TabsTrigger value="usuarios">
              <Users className="h-4 w-4 mr-2" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="resultados">
              <Settings className="h-4 w-4 mr-2" />
              Resultados
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rodadas">
            <RoundsManagement />
          </TabsContent>

          <TabsContent value="jogos">
            <MatchesManagement />
          </TabsContent>

          <TabsContent value="usuarios">
            <UsersManagement />
          </TabsContent>

          <TabsContent value="resultados">
            <ResultsManagement />
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
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRound, setEditingRound] = useState(null);

  useEffect(() => {
    loadRounds();
  }, []);

  const loadRounds = async () => {
    try {
      const { data, error } = await supabase
        .from('rounds')
        .select('*, competition:competitions(*)')
        .order('round_number', { ascending: false });

      if (error) throw error;
      setRounds(data || []);
    } catch (error) {
      console.error('Erro ao carregar rodadas:', error);
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
      loadRounds();
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
          onClose={() => { setShowForm(false); setEditingRound(null); }}
          onSave={() => { setShowForm(false); setEditingRound(null); loadRounds(); }}
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
                  <p className="font-medium">{round.status}</p>
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

// Componente de formulário de rodada (será implementado)
function RoundForm({ round, onClose, onSave }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{round ? 'Editar Rodada' : 'Nova Rodada'}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Formulário em desenvolvimento...</p>
        <div className="flex gap-2 mt-4">
          <Button onClick={onClose} variant="outline">Cancelar</Button>
          <Button onClick={onSave}>Salvar</Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Placeholders para outras seções
function MatchesManagement() {
  return <Card><CardContent className="py-8"><p className="text-center text-muted-foreground">Gerenciamento de Jogos - Em desenvolvimento</p></CardContent></Card>;
}

function UsersManagement() {
  return <Card><CardContent className="py-8"><p className="text-center text-muted-foreground">Gerenciamento de Usuários - Em desenvolvimento</p></CardContent></Card>;
}

function ResultsManagement() {
  return <Card><CardContent className="py-8"><p className="text-center text-muted-foreground">Inserção de Resultados - Em desenvolvimento</p></CardContent></Card>;
}

