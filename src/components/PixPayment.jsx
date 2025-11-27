import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { QRCodeSVG } from 'qrcode.react';
import { Upload, Check, X, Copy, AlertCircle } from 'lucide-react';

export default function PixPayment({ ticketId, amount, onSuccess, onCancel }) {
  const [pixKey, setPixKey] = useState('');
  const [pixRecipient, setPixRecipient] = useState('');
  const [pixData, setPixData] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadPixConfig();
  }, []);

  const loadPixConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('competitions')
        .select('pix_key, pix_recipient_name')
        .limit(1)
        .single();

      if (error) throw error;
      
      if (data) {
        setPixKey(data.pix_key || 'Chave PIX não configurada');
        setPixRecipient(data.pix_recipient_name || 'Bolão FPT');
        
        // Gerar PIX Copia e Cola (formato simplificado)
        const pixPayload = generatePixPayload(data.pix_key, amount, data.pix_recipient_name);
        setPixData(pixPayload);
      }
    } catch (error) {
      console.error('Erro ao carregar configuração PIX:', error);
    }
  };

  const generatePixPayload = (key, value, name) => {
    // Formato simplificado - em produção use biblioteca como pix-utils
    return `${key}|${value}|${name}`;
  };

  const copyPixKey = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProofFile(file);
    }
  };

  const uploadProof = async () => {
    if (!proofFile) {
      alert('⚠️ Selecione o comprovante primeiro');
      return;
    }

    setUploading(true);
    try {
      // Upload do arquivo (simulado - em produção use storage do Supabase)
      const fileName = `proof_${ticketId}_${Date.now()}.${proofFile.name.split('.').pop()}`;
      
      // Atualizar ticket com status "paid" e URL do comprovante
      const { error } = await supabase
        .from('tickets')
        .update({
          payment_status: 'paid',
          payment_proof_url: fileName,
          paid_at: new Date().toISOString()
        })
        .eq('id', ticketId);

      if (error) throw error;

      alert('✅ Comprovante enviado! Aguarde a confirmação do administrador.');
      onSuccess();
    } catch (error) {
      console.error('Erro ao enviar comprovante:', error);
      alert('❌ Erro ao enviar comprovante: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Pagamento via PIX</h2>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="text-center space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Valor a pagar</p>
            <p className="text-3xl font-bold text-green-600">
              R$ {amount.toFixed(2)}
            </p>
          </div>

          {pixKey !== 'Chave PIX não configurada' ? (
            <>
              <div className="bg-white border-2 border-gray-200 p-4 rounded-lg">
                <QRCodeSVG 
                  value={pixData} 
                  size={200}
                  className="mx-auto"
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Chave PIX:</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={pixKey}
                    readOnly
                    className="flex-1 px-3 py-2 border rounded-lg bg-gray-50 text-sm"
                  />
                  <button
                    onClick={copyPixKey}
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Instruções:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Escaneie o QR Code ou copie a chave PIX</li>
                      <li>Faça o pagamento no app do seu banco</li>
                      <li>Tire um print do comprovante</li>
                      <li>Envie o comprovante abaixo</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Enviar Comprovante:</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="mt-1 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                </label>

                {proofFile && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Check className="h-4 w-4" />
                    <span>{proofFile.name}</span>
                  </div>
                )}

                <button
                  onClick={uploadProof}
                  disabled={!proofFile || uploading}
                  className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold
                    hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed
                    flex items-center justify-center gap-2"
                >
                  <Upload className="h-5 w-5" />
                  {uploading ? 'Enviando...' : 'Enviar Comprovante'}
                </button>
              </div>
            </>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">
                ⚠️ Chave PIX não configurada. Entre em contato com o administrador.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

