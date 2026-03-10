```typescript
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client'; // Assumindo este caminho para o
cliente Supabase
import {
DndContext,
closestCorners,
KeyboardSensor,
PointerSensor,
useSensor,
useSensors,
DragEndEvent,
} from '@dnd-kit/core';
import {
SortableContext,
verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
// --- UI Components (Shadcn UI) ---
// Certifique-se de que estes componentes estão instalados e configurados em seu projeto.

'@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from
'@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
// --- Icons (lucide-react) ---
// Certifique-se de que 'lucide-react' está instalado.
import { Car, DollarSign, Clock, User, Phone, Mail, Edit, Info } from 'lucide-react';
// --- Supabase Types ---
// Estes tipos são baseados na estrutura das suas tabelas no Supabase.
// Em um projeto real, eles estariam em 'src/integrations/supabase/types.ts' ou seriam gerados.
export type Contact = {
id: string;
name: string;
phone: string;
email: string | null;
source: string | null;
preferences: string | null;
notes: string | null;
created_at: string;
whatsapp: string | null;
lead_source: string | null;
payment_type: string | null;
urgency: string | null;

active:cursor-grabbing"
>
{deal.contact?.name || 'Contato Desconhecido'}
onEdit(deal)}>
{deal.contact?.whatsapp && (
{deal.contact.whatsapp}
)}
{deal.vehicle_interest && (
{interestConfig(deal.vehicle_interest).icon} {deal.vehicle_interest}
)}
{deal.payment_type && (
{paymentTypeConfig(deal.payment_type).icon} {deal.payment_type}
)}
{deal.urgency && (
{urgencyConfig(deal.urgency).icon} {deal.urgency}
)}
{deal.value && (
R$ {deal.value.toLocaleString('pt-BR')}
)}
{deal.notes && (
{deal.notes}
)}
);
}
// --- Componente PipelineColumn ---
// Representa uma coluna (etapa) no pipeline.

atualização
.eq('id', dealId); // Condição para atualizar o negócio correto
if (error) throw error;
} catch (err: any) {
console.error('Erro ao atualizar o estágio do negócio:', err.message);
setError('Falha ao atualizar o estágio do negócio.');
// Em caso de erro, você pode reverter a UI ou re-buscar os dados (fetchDeals)
}
};
// --- Lida com a Abertura do Modal de Edição ---
const handleEditDeal = (deal: Deal) => {
setEditingDeal(deal); // Define o negócio a ser editado
setIsModalOpen(true); // Abre o modal
};
// --- Lida com o Fechamento do Modal ---
const handleCloseModal = () => {
setIsModalOpen(false); // Fecha o modal
setEditingDeal(null); // Limpa o negócio em edição
};
// --- Lida com o Salvamento das Alterações do Negócio ---
const handleSaveDeal = async () => {
if (!editingDeal) return; // Se não há negócio em edição, não faz nada
setLoading(true); // Ativa o estado de carregamento
try {
// Atualiza os detalhes do negócio no Supabase
const { error } = await supabase
.from('deals')

Carregando pipeline...
);
}
if (error) {
return (
Erro: {error}
);
}
return (
Pipeline de Vendas
<DndContext
sensors={sensors}
collisionDetection={closestCorners} // Estratégia de detecção de colisão
onDragEnd={handleDragEnd} // Função chamada ao finalizar o arrastar
>
{PIPELINE_STAGES.map((stage) => (
<PipelineColumn
key={stage.key}
id={stage.key}
title={stage.label}
color={stage.color}
deals={deals.filter((deal) => deal.stage === stage.key)} // Filtra deals por estágio
onEditDeal={handleEditDeal}
/>
))}
{/ Modal de Edição de Negócio /}
