typescript
import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Car,
  Phone,
  Mail,
  Calendar,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Info,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Wallet,
  Zap,
  FileText,
  Truck,
  User,
  Hash,
  Tag,
  MapPin,
  Gauge,
  Palette,
  CalendarDays,
  Euro,
  ClipboardList,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

// --- Inferred Types based on Supabase schema and mockData ---
// These types should ideally be in src/integrations/supabase/types.ts
// For now, they are defined here for completeness.
interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  whatsapp?: string;
  lead_source?: string;
  payment_type?: string;
  urgency?: string;
  vehicle_interest?: string;
  status?: string;
  created_at?: string;
}

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  color?: string;
  mileage?: number;
  status?: string;
  description?: string;
  created_at?: string;
}

interface Conversation {
  id: string;
  contact_id: string;
  status: string;
  channel: string;
  assigned_to?: string;
  created_at?: string;
  updated_at?: string;
  ai_summary?: string;
  ai_intent?: string;
  ai_stage?: string;
  last_message?: string;
  last_message_at?: string;
}

interface Deal {
  id: string;
  contact_id: string;
  vehicle_id?: string;
  stage: string;
  value?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  vehicle_interest?: string;
  payment_type?: string;
  urgency?: string;
  // Joined data from other tables
  contact?: Contact;
  vehicle?: Vehicle;
  conversation?: Conversation;
}

// --- Static Data (from mockData.ts, now embedded or imported if shared) ---
const PIPELINE_STAGES = [
  { key: 'new', label: 'Novo Lead', color: 'bg-blue-500' },
  { key: 'contacted', label: 'Contatado', color: 'bg-yellow-500' },
  { key: 'negotiation', label: 'Negociação', color: 'bg-purple-500' },
  { key: 'proposal', label: 'Proposta', color: 'bg-indigo-500' },
  { key: 'closed_won', label: 'Fechado Ganho', color: 'bg-green-500' },
  { key: 'closed_lost', label: 'Fechado Perdido', color: 'bg-red-500' },
];

const paymentLabels: { [key: string]: string } = {
  financiamento: 'Financiamento',
  a_vista: 'À Vista',
  troca: 'Troca',
};

export function PipelinePage() {
  const [deals, setDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedDealId, setExpandedDealId] = useState(null);

  const draggingDealId = useRef(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // --- Data Fetching from Supabase ---
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [
          { data: dealsData, error: dealsError },
          { data: contactsData, error: contactsError },
          { data: vehiclesData, error: vehiclesError },
          { data: conversationsData, error: conversationsError },
        ] = await Promise.all([
          supabase.from('deals').select('*'),
          supabase.from('contacts').select('*'),
          supabase.from('vehicles').select('*'),
          supabase.from('conversations').select('*'),
        ]);

        if (dealsError) throw dealsError;
        if (contactsError) throw contactsError;
        if (vehiclesError) throw vehiclesError;
        if (conversationsError) throw conversationsError;

        setDeals(dealsData || []);
        setContacts(contactsData || []);
        setVehicles(vehiclesData || []);
        setConversations(conversationsData || []);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(`Failed to load data: ${err.message}`);
        toast({
          title: 'Erro ao carregar dados',
          description: `Não foi possível carregar os dados do pipeline: ${err.message}`,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();

    // --- Realtime Subscription ---
    const dealsChannel = supabase
      .channel('public:deals')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deals' }, payload => {
        setDeals(prevDeals => {
          if (payload.eventType === 'INSERT') {
            return [...prevDeals, payload.new as Deal];
          } else if (payload.eventType === 'UPDATE') {
            return prevDeals.map(deal =>
              deal.id === payload.old.id ? (payload.new as Deal) : deal
            );
          } else if (payload.eventType === 'DELETE') {
            return prevDeals.filter(deal => deal.id !== payload.old.id);
          }
          return prevDeals;
        });
      })
      .subscribe();

    const contactsChannel = supabase
      .channel('public:contacts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contacts' }, payload => {
        setContacts(prevContacts => {
          if (payload.eventType === 'INSERT') {
            return [...prevContacts, payload.new as Contact];
          } else if (payload.eventType === 'UPDATE') {
            return prevContacts.map(contact =>
              contact.id === payload.old.id ? (payload.new as Contact) : contact
            );
          } else if (payload.eventType === 'DELETE') {
            return prevContacts.filter(contact => contact.id !== payload.old.id);
          }
          return prevContacts;
        });
      })
      .subscribe();

    const vehiclesChannel = supabase
      .channel('public:vehicles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, payload => {
        setVehicles(prevVehicles => {
          if (payload.eventType === 'INSERT') {
            return [...prevVehicles, payload.new as Vehicle];
          } else if (payload.eventType === 'UPDATE') {
            return prevVehicles.map(vehicle =>
              vehicle.id === payload.id ? (payload.new as Vehicle) : vehicle
            );
          } else if (payload.eventType === 'DELETE') {
            return prevVehicles.filter(vehicle => vehicle.id !== payload.old.id);
          }
          return prevVehicles;
        });
      })
      .subscribe();

    const conversationsChannel = supabase
      .channel('public:conversations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, payload => {
        setConversations(prevConversations => {
          if (payload.eventType === 'INSERT') {
            return [...prevConversations, payload.new as Conversation];
          } else if (payload.eventType === 'UPDATE') {
            return prevConversations.map(conversation =>
              conversation.id === payload.old.id ? (payload.new as Conversation) : conversation
            );
          } else if (payload.eventType === 'DELETE') {
            return prevConversations.filter(conversation => conversation.id !== payload.old.id);
          }
          return prevConversations;
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(dealsChannel);
      supabase.removeChannel(contactsChannel);
      supabase.removeChannel(vehiclesChannel);
      supabase.removeChannel(conversationsChannel);
    };
  }, [toast]);

  // --- Helper Functions ---
  const getDealData = useCallback((deal: Deal) => {
    const contact = contacts.find(c => c.id === deal.contact_id);
    const vehicle = vehicles.find(v => v.id === deal.vehicle_id);
    const conversation = conversations.find(conv => conv.contact_id === deal.contact_id); // Assuming 1 conv per contact for simplicity
    return { ...deal, contact, vehicle, conversation };
  }, [contacts, vehicles, conversations]);

  const interestConfig = useCallback((interest: string | undefined) => {
    if (!interest) return { icon: , color: 'bg-gray-500' };
    if (interest.includes('financiamento')) return { icon: , color: 'bg-blue-500' };
    if (interest.includes('a_vista')) return { icon: , color: 'bg-green-500' };
    if (interest.includes('troca')) return { icon: , color: 'bg-yellow-500' };
    return { icon: , color: 'bg-gray-500' };
  }, []);

  const stageTotal = useCallback((stageKey: string) => {
    const stageDeals = deals.filter(deal => deal.stage === stageKey);
    const totalValue = stageDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
    return { count: stageDeals.length, value: totalValue };
  }, [deals]);

  // --- Drag and Drop Handlers ---
  const handleDragStart = useCallback((e: React.DragEvent, dealId: string) => {
    draggingDealId.current = dealId;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', dealId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-dashed', 'border-2', 'border-blue-400');
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.currentTarget.classList.remove('border-dashed', 'border-2', 'border-blue-400');
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent, targetStageKey: string) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-dashed', 'border-2', 'border-blue-400');
    const dealId = e.dataTransfer.getData('text/plain');

    if (dealId && draggingDealId.current === dealId) {
      await handleStageChange(dealId, targetStageKey);
      draggingDealId.current = null;
    }
  }, []);

  const handleDragEnd = useCallback(() => {
    draggingDealId.current = null;
  }, []);

  const handleToggleExpand = useCallback((dealId: string) => {
    setExpandedDealId(prevId => (prevId === dealId ? null : dealId));
  }, []);

  const handleStageChange = useCallback(async (dealId: string, targetStage: string) => {
    try {
      const { error: updateError } = await supabase
        .from('deals')
        .update({ stage: targetStage, updated_at: new Date().toISOString() })
        .eq('id', dealId);

      if (updateError) throw updateError;

      toast({
        title: 'Deal atualizado',
        description: `Deal movido para a etapa "${PIPELINE_STAGES.find(s => s.key === targetStage)?.label}".`,
      });
    } catch (err: any) {
      console.error('Error updating deal stage:', err);
      toast({
        title: 'Erro ao mover deal',
        description: `Não foi possível mover o deal: ${err.message}`,
        variant: 'destructive',
      });
    }
  }, [toast]);

  if (loading) {
    return (
      
        Carregando Pipeline...
      
    );
  }

  if (error) {
    return (
      
        Erro: {error}
      
    );
  }

  return (
    
      Pipeline de Vendas

      
        
          {PIPELINE_STAGES.map(stage => {
            const { count, value } = stageTotal(stage.key);
            const stageDeals = deals.filter(deal => deal.stage === stage.key).map(getDealData);

            return (
               handleDrop(e, stage.key)}
              >
                
                  
                    {stage.label}
                  
                  
                    {count} Deals ({value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})
                  
                

                
                  
                    {stageDeals.map(deal => (
                      
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        transition={{ duration: 0.3 }}
                        className="bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm p-4 cursor-grab active:cursor-grabbing"
                        draggable
                        onDragStart={(e) => handleDragStart(e, deal.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => handleToggleExpand(deal.id)}
                      >
                        
                          
                             {deal.contact?.name || 'Cliente Desconhecido'}
                          
                          
                            
                              
                            
                            
                              {PIPELINE_STAGES.filter(s => s.key !== deal.stage).map(s => (
                                 { e.stopPropagation(); handleStageChange(deal.id, s.key); }}>
                                  Mover para {s.label}
                                
                              ))}
                            
                          
                        

                        
                           {deal.vehicle_interest || deal.vehicle?.model || 'Veículo não especificado'}
                        

                        
                          {deal.payment_type && (
                            
                              {interestConfig(deal.payment_type).icon} {paymentLabels[deal.payment_type] || deal.payment_type}
                            
                          )}
                          {deal.urgency && (
                            
                               {deal.urgency === 'decided' ? 'Urgente' : 'Pesquisando'}
                            
                          )}
                          {deal.value && (
                            
                               {deal.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            
                          )}
                        

                        
                          {expandedDealId === deal.id && (
                            
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden pt-3 border-t border-gray-200 dark:border-gray-600"
                            >
                              
                                
                                
                                  **Resumo IA:** {deal.conversation?.ai_summary || 'Nenhum resumo disponível.'}
                                
                              
                              {deal.contact?.phone && (
                                
                                   {deal.contact.phone}
                                
                              )}
                              {deal.contact?.email && (
                                
                                   {deal.contact.email}
                                
                              )}
                              {deal.contact?.whatsapp && (
                                
                                   {deal.contact.whatsapp}
                                
                              )}
                              {deal.created_at && (
                                
                                   Criado em: {format(new Date(deal.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                                
                              )}
                              {deal.updated_at && (
                                
                                   Última atualização: {format(new Date(deal.updated_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                                
                              )}
                              {deal.notes && (
                                
                                   Notas: {deal.notes}
                                
                              )}
                              {deal.vehicle && (
                                
                                  
                                     Detalhes do Veículo:
                                  
                                  
                                     {deal.vehicle.brand} {deal.vehicle.model} ({deal.vehicle.year})
                                     {deal.vehicle.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                     {deal.vehicle.color}
                                     {deal.vehicle.mileage?.toLocaleString('pt-BR')} km
                                  
                                
                              )}
                            
                          )}
                        
                      
                    ))}
                  
                
              
            );
          })}
        
      
    
  );
}
