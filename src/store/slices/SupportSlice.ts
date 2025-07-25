// Redux slice for managing support tickets and responses
import { createSlice,type PayloadAction } from '@reduxjs/toolkit';
import type { SupportTicket, SupportResponse } from '../../types/settings';
import supportTicketsData from '../../../mockServer/data/SupportTickets.json';

interface SupportState {
  tickets: SupportTicket[];
  userTickets: SupportTicket[];
  selectedTicket: SupportTicket | null;
  loading: boolean;
  error: string | null;
}

// Initial state with support tickets loaded from JSON data
const initialState: SupportState = {
  tickets: supportTicketsData as SupportTicket[],
  userTickets: [],
  selectedTicket: null,
  loading: false,
  error: null,
};

// Create support slice with reducers for ticket management
const supportSlice = createSlice({
  name: 'support',
  initialState,
  reducers: {
    // Filter and set tickets for current user
    setUserTickets: (state, action: PayloadAction<string>) => {
      const userId = action.payload;
      state.userTickets = state.tickets.filter(ticket => ticket.userId === userId);
    },
    
    // Add a new support ticket
    addSupportTicket: (state, action: PayloadAction<SupportTicket>) => {
      const newTicket = action.payload;
      state.tickets.push(newTicket);
      // If this ticket belongs to current user, add to userTickets
      if (state.userTickets.length > 0 && 
          state.userTickets[0]?.userId === newTicket.userId) {
        state.userTickets.push(newTicket);
      }
    },
    
    // Update existing support ticket
    updateSupportTicket: (state, action: PayloadAction<SupportTicket>) => {
      const updatedTicket = action.payload;
      const index = state.tickets.findIndex(ticket => ticket.id === updatedTicket.id);
      
      if (index !== -1) {
        state.tickets[index] = updatedTicket;
        
        // Update in userTickets if present
        const userIndex = state.userTickets.findIndex(
          ticket => ticket.id === updatedTicket.id
        );
        if (userIndex !== -1) {
          state.userTickets[userIndex] = updatedTicket;
        }
        
        // Update selectedTicket if it's the same ticket
        if (state.selectedTicket?.id === updatedTicket.id) {
          state.selectedTicket = updatedTicket;
        }
      }
    },
    
    // Add response to a support ticket
    addTicketResponse: (state, action: PayloadAction<{
      ticketId: string;
      response: SupportResponse;
    }>) => {
      const { ticketId, response } = action.payload;
      
      // Find and update ticket in main tickets array
      const ticketIndex = state.tickets.findIndex(ticket => ticket.id === ticketId);
      if (ticketIndex !== -1) {
        if (!state.tickets[ticketIndex].responses) {
          state.tickets[ticketIndex].responses = [];
        }
        state.tickets[ticketIndex].responses!.push(response);
        state.tickets[ticketIndex].updatedAt = new Date().toISOString();
      }
      
      // Update in userTickets if present
      const userTicketIndex = state.userTickets.findIndex(
        ticket => ticket.id === ticketId
      );
      if (userTicketIndex !== -1) {
        if (!state.userTickets[userTicketIndex].responses) {
          state.userTickets[userTicketIndex].responses = [];
        }
        state.userTickets[userTicketIndex].responses!.push(response);
        state.userTickets[userTicketIndex].updatedAt = new Date().toISOString();
      }
      
      // Update selectedTicket if it's the same ticket
      if (state.selectedTicket?.id === ticketId) {
        if (!state.selectedTicket.responses) {
          state.selectedTicket.responses = [];
        }
        state.selectedTicket.responses.push(response);
        state.selectedTicket.updatedAt = new Date().toISOString();
      }
    },
    
    // Set selected ticket for detailed view
    setSelectedTicket: (state, action: PayloadAction<SupportTicket | null>) => {
      state.selectedTicket = action.payload;
    },
    
    // Close/resolve a support ticket
    closeTicket: (state, action: PayloadAction<string>) => {
      const ticketId = action.payload;
      const now = new Date().toISOString();
      
      // Update in main tickets array
      const ticketIndex = state.tickets.findIndex(ticket => ticket.id === ticketId);
      if (ticketIndex !== -1) {
        state.tickets[ticketIndex].status = 'closed';
        state.tickets[ticketIndex].resolvedAt = now;
        state.tickets[ticketIndex].updatedAt = now;
      }
      
      // Update in userTickets if present
      const userTicketIndex = state.userTickets.findIndex(
        ticket => ticket.id === ticketId
      );
      if (userTicketIndex !== -1) {
        state.userTickets[userTicketIndex].status = 'closed';
        state.userTickets[userTicketIndex].resolvedAt = now;
        state.userTickets[userTicketIndex].updatedAt = now;
      }
      
      // Update selectedTicket if it's the same ticket
      if (state.selectedTicket?.id === ticketId) {
        state.selectedTicket.status = 'closed';
        state.selectedTicket.resolvedAt = now;
        state.selectedTicket.updatedAt = now;
      }
    },
    
    // Set loading state for async operations
    setSupportLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    // Set error message for support operations
    setSupportError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

// Export actions for use in components
export const {
  setUserTickets,
  addSupportTicket,
  updateSupportTicket,
  addTicketResponse,
  setSelectedTicket,
  closeTicket,
  setSupportLoading,
  setSupportError,
} = supportSlice.actions;

// Export reducer for store configuration
export default supportSlice.reducer;