import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CheckCircle2, Circle } from 'lucide-react';

export function BettingInterface({ round, matches, onSubmit, onCancel }) {
  const [predictions, setPredictions] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePrediction = (matchId, result) => {
    setPredictions(prev => ({
      ...prev,
      [matchId]: result
    }));
  };

  const allPredictionsMade = matches.every(match => predictions[match.id]);
  const predictionCount = Object.keys(predictions).length;

  const handleSubmit = async () => {
    if (!allPredictionsMade) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(predictions);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getButtonVariant = (matchId, result) => {
    return predictions[matchId] === result ? 'default' : 'outline';
  };

  return (
    <Card>
      <CardHeader className="bg-primary text-primary-foreground">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Fazer Palpites</CardTitle>
            <CardDescription className="text-primary-foreground/80">
              {round.name} - Escolha o resultado de cada jogo
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {predictionCount}/{matches.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4 mb-6">
          {matches.map((match) => (
            <div
              key={match.id}
              className="border rounded-lg p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center gap-2">
                    {predictions[match.id] ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <span>{new Date(match.scheduled_at).toLocaleDateString('pt-BR')}</span>
                      <span>•</span>
                      <span>{new Date(match.scheduled_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="font-semibold text-lg">
                      {match.home_team?.short_name || match.home_team?.name}
                      {' vs '}
                      {match.away_team?.short_name || match.away_team?.name}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={getButtonVariant(match.id, 'HOME')}
                  onClick={() => handlePrediction(match.id, 'HOME')}
                  className="w-full"
                >
                  Casa
                </Button>
                <Button
                  variant={getButtonVariant(match.id, 'DRAW')}
                  onClick={() => handlePrediction(match.id, 'DRAW')}
                  className="w-full"
                >
                  Empate
                </Button>
                <Button
                  variant={getButtonVariant(match.id, 'AWAY')}
                  onClick={() => handlePrediction(match.id, 'AWAY')}
                  className="w-full"
                >
                  Fora
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t pt-4 space-y-4">
          <div className="flex items-center justify-between text-lg">
            <span className="font-semibold">Valor da Cartela:</span>
            <span className="text-2xl font-bold text-primary">
              R$ {round.ticket_price?.toFixed(2) || '10.00'}
            </span>
          </div>

          {!allPredictionsMade && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
              ⚠️ Você precisa fazer palpites em todos os {matches.length} jogos para continuar
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={!allPredictionsMade || isSubmitting}
            >
              {isSubmitting ? 'Confirmando...' : 'Confirmar Palpites'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

