typescript
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Car, DollarSign, Clock, CheckCircle, XCircle, Info, Phone, Mail, User, Tag, Calendar, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

// Definições de tipos para o Supabase
interface Deal {
  id: string;
  contact_id: string;
  vehicle_id?: string;
  stage: string;
  value?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  vehicle_interest?: string;
  payment_type?: string;
  urgency?: string;
  notified_at?: string;
  contact?: Contact; // Adicionado para incluir dados do contato
}

interface Contact {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  source?: string;
  preferences?: string;
  notes?: string;
  created_at: string;
  whatsapp?: string;
  lead_source?: string;
  payment_type?: string;
  urgency?: string;
  vehicle_interest?: string;
  status?: string;
}

interface Stage {
  key: string;
  label: string;
  color: string;
}

const PIPELINE_STAGES: Stage[] = [
  { key: 'collecting', label: 'Coletando', color: 'bg-gray-500' },
  { key: 'interested', label: 'Interessados', color: 'bg-blue-500' },
  { key: 'hot_lead', label: 'Hot Leads', color: 'bg-orange-500' },
  { key: 'negotiation', label: 'Negociação', color: 'bg-purple-500' },
  { key: 'closed_won', label: 'Fechado Ganho', color: 'bg-green-500' },
  { key: 'closed_lost', label: 'Fechado Perdido', color: 'bg-red-500' },
];

// Componente SortableItem
const SortableItem: React.FC<{ deal: Deal; onEdit: (deal: Deal) => void; onDelete: (id: string) => void }> = ({ deal, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const interestConfig = useCallback((interest: string | undefined) => {
    if (!interest) return { icon: , color: 'bg-gray-500' };
    if (interest.includes('financiamento')) return { icon: , color: 'bg-blue-500' };
    if (interest.includes('a_vista')) return { icon: , color: 'bg-green-500' };
    return { icon: , color: 'bg-gray-500' };
  }, []);

  const urgencyConfig = useCallback((urgency: string | undefined) => {
    if (!urgency) return { icon: , color: 'text-gray-600' };
    if (urgency === 'high') return { icon: , color: 'text-red-600' };
    if (urgency === 'medium') return { icon: , color: 'text-orange-600' };
    return { icon: , color: 'text-blue-600' };
  }, []);

  const currentInterest = interestConfig(deal.payment_type);
  const currentUrgency = urgencyConfig(deal.urgency);

  return (
    
      
        
          
          {deal.contact?.name || 'Contato Desconhecido'}
        
        
          
            
              
            
          
          
             onEdit(deal)}>
               Editar
            
             onDelete(deal.id)}>
               Excluir
            
          
        
      
      
        R$ {deal.value?.toLocaleString('pt-BR') || '0,00'}
        
          {currentInterest.icon} {deal.vehicle_interest || 'Sem interesse'}
        
        
          {currentUrgency.icon} Urgência: {deal.urgency || 'Não definida'}
        
        
           {format(new Date(deal.created_at), 'dd/MM/yyyy')}
        
      
    
  );
};

// Componente PipelineColumn
const PipelineColumn: React.FC<{ stage: Stage; deals: Deal[]; onEdit: (deal: Deal) => void; onDelete: (id: string) => void; onStageChange: (dealId: string, newStage: string) => void }> = ({ stage, deals, onEdit, onDelete, onStageChange }) => {
  return (
    
      
        {stage.label} ({deals.length})
      
       d.id)} strategy={verticalListSortingStrategy}>
        {deals.map((deal) => (
          
            
            
              
                
                  Mover para...
                
              
              
                {PIPELINE_STAGES.filter(s => s.key !== stage.key).map(s => (
                   onStageChange(deal.id, s.key)}>
                    {s.label}
                  
                ))}
              
            
          
        ))}
      
    
  );
};

// Componente principal PipelinePage
const PipelinePage: React.FC = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDeal, setCurrentDeal] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchDeals = useCallback(async () => {
    setLoading(true);
    try {
      const { data: dealsData, error: dealsError } = await supabase
        .from('deals')
        .select(`
          *,
          contact (
            id, name, phone, email, whatsapp
          )
        `);

      if (dealsError) throw dealsError;

      setDeals(dealsData as Deal[]);
    } catch (err: any) {
      console.error('Erro ao buscar deals:', err.message);
      setError('Erro ao carregar os negócios. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeals();

    // Realtime subscription
    const channel = supabase
      .channel('public:deals')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deals' }, payload => {
        console.log('Change received!', payload);
        fetchDeals(); // Re-fetch all deals on any change
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchDeals]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const dealId = active.id as string;
    const newStage = over.id as string; // Assuming over.id is the stage key

    const dealToUpdate = deals.find(d => d.id === dealId);
    if (dealToUpdate && dealToUpdate.stage !== newStage) {
      // Optimistic update
      setDeals(prevDeals =>
        prevDeals.map(deal =>
          deal.id === dealId ? { ...deal, stage: newStage } : deal
        )
      );

      try {
        const { error } = await supabase
          .from('deals')
          .update({ stage: newStage, updated_at: new Date().toISOString() })
          .eq('id', dealId);

        if (error) throw error;
      } catch (err: any) {
        console.error('Erro ao atualizar stage do deal:', err.message);
        setError('Erro ao mover o negócio. Desfazendo a alteração.');
        // Revert optimistic update on error
        setDeals(prevDeals =>
          prevDeals.map(deal =>
            deal.id === dealId ? { ...deal, stage: dealToUpdate.stage } : deal
          )
        );
      }
    }
  };

  const handleEditDeal = (deal: Deal) => {
    setCurrentDeal(deal);
    setIsModalOpen(true);
  };

  const handleDeleteDeal = async (dealId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este negócio?')) return;

    try {
      const { error } = await supabase
        .from('deals')
        .delete()
        .eq('id', dealId);

      if (error) throw error;

      setDeals(prevDeals => prevDeals.filter(deal => deal.id !== dealId));
    } catch (err: any) {
      console.error('Erro ao excluir deal:', err.message);
      setError('Erro ao excluir o negócio. Tente novamente.');
    }
  };

  const handleSaveDeal = async () => {
    if (!currentDeal) return;

    try {
      const { error } = await supabase
        .from('deals')
        .update({
          value: currentDeal.value,
          notes: currentDeal.notes,
          payment_type: currentDeal.payment_type,
          vehicle_interest: currentDeal.vehicle_interest,
          urgency: currentDeal.urgency,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentDeal.id);

      if (error) throw error;

      setIsModalOpen(false);
      setCurrentDeal(null);
      fetchDeals(); // Re-fetch to ensure data consistency
    } catch (err: any) {
      console.error('Erro ao salvar deal:', err.message);
      setError('Erro ao salvar o negócio. Tente novamente.');
    }
  };

  const handleStageChange = async (dealId: string, targetStage: string) => {
    const dealToUpdate = deals.find(d => d.id === dealId);
    if (dealToUpdate && dealToUpdate.stage !== targetStage) {
      setDeals(prev => prev.map(d => d.id === dealId ? { ...d, stage: targetStage } : d));
      try {
        const { error } = await supabase.from('deals').update({ stage: targetStage, updated_at: new Date().toISOString() }).eq('id', dealId);
        if (error) throw error;
      } catch (err: any) {
        console.error('Erro ao atualizar stage do deal via dropdown:', err.message);
        setError('Erro ao mover o negócio. Desfazendo a alteração.');
        setDeals(prev => prev.map(d => d.id === dealId ? { ...d, stage: dealToUpdate.stage } : d));
      }
    }
  };

  if (loading) {
    return Carregando pipeline...;
  }

  if (error) {
    return {error};
  }

  return (
    
      Pipeline de Vendas
      
        
          {PIPELINE_STAGES.map((stage) => (
             deal.stage === stage.key)}
              onEdit={handleEditDeal}
              onDelete={handleDeleteDeal}
              onStageChange={handleStageChange}
            />
          ))}
        

        {/* Modal de Edição de Negócio */}
        
          
            
              Editar Negócio
            
            {currentDeal && (
              
                
                  
                    Contato
                  
                  
                
                
                  
                    Valor
                  
                  
                      setCurrentDeal({ ...currentDeal, value: parseFloat(e.target.value) || 0 })
                    }
                    className="col-span-3"
                  />
                
                
                  
                    Interesse Veículo
                  
                  
                      setCurrentDeal({ ...currentDeal, vehicle_interest: e.target.value })
                    }
                    className="col-span-3"
                  />
                
                
                  
                    Pagamento
                  
                  
                      setCurrentDeal({ ...currentDeal, payment_type: e.target.value })
                    }
                    className="col-span-3"
                  />
                
                
                  
                    Urgência
                  
                  
                      setCurrentDeal({ ...currentDeal, urgency: e.target.value })
                    }
                    className="col-span-3"
                  />
                
                
                  
                    Notas
                  
                                        setCurrentDeal({ ...currentDeal, notes: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveDeal}>Salvar Alterações</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DndContext>
    </div>
  );
};

export default PipelinePage;
