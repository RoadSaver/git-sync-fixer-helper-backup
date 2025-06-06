import { supabase } from './supabaseClient'; // Assume Supabase client is configured

// Types
type User = {
  id: string;
  location: { lat: number; lng: number };
};

type Employee = {
  id: string;
  name: string;
  location: { lat: number; lng: number };
};

type PriceQuote = {
  id: string;
  amount: number;
  isRevised: boolean;
  employeeId: string;
  requestId: string;
};

type Request = {
  id: string;
  userId: string;
  status: 'pending' | 'quoted' | 'revised' | 'accepted' | 'in_progress' | 'completed';
  currentEmployeeId: string | null;
  blacklistedEmployeeIds: string[]; // Per-request blacklist
};

// State Manager
class RequestManager {
  private activeRequests: Map<string, Request> = new Map();
  private employees: Employee[] = []; // Available employees
  private requestQueue: string[] = []; // IDs of pending requests

  // Initialize with mock employees
  constructor(employees: Employee[]) {
    this.employees = employees;
  }

  // User creates request
  async createRequest(userId: string): Promise<string> {
    const requestId = `req_${Date.now()}`;
    const newRequest: Request = {
      id: requestId,
      userId,
      status: 'pending',
      currentEmployeeId: null,
      blacklistedEmployeeIds: [],
    };
    
    this.activeRequests.set(requestId, newRequest);
    this.requestQueue.push(requestId);
    this.processQueue();
    return requestId;
  }

  // Assign request to available employee
  private processQueue() {
    for (const requestId of this.requestQueue) {
      const request = this.activeRequests.get(requestId)!;
      const availableEmployee = this.employees.find(
        e => !request.blacklistedEmployeeIds.includes(e.id)
      );

      if (availableEmployee) {
        this.assignEmployee(requestId, availableEmployee.id);
        this.requestQueue = this.requestQueue.filter(id => id !== requestId);
      }
    }
  }

  // Employee accepts request
  private async assignEmployee(requestId: string, employeeId: string) {
    const request = this.activeRequests.get(requestId)!;
    request.currentEmployeeId = employeeId;
    request.status = 'quoted';
    this.activeRequests.set(requestId, request);

    // Simulate price quote
    const quote = await this.generatePriceQuote(requestId, employeeId);
    this.sendQuoteToUser(quote);
  }

  private async generatePriceQuote(requestId: string, employeeId: string): Promise<PriceQuote> {
    return {
      id: `quote_${Date.now()}`,
      amount: Math.floor(Math.random() * 100) + 50, // Random price
      isRevised: false,
      employeeId,
      requestId,
    };
  }

  // User declines quote
  async handleDecline(quote: PriceQuote) {
    const request = this.activeRequests.get(quote.requestId)!;
    const employee = this.employees.find(e => e.id === quote.employeeId)!;

    // Check if this is first decline
    if (!quote.isRevised) {
      // Send revised quote
      const revisedQuote = await this.generatePriceQuote(request.id, employee.id);
      revisedQuote.isRevised = true;
      this.sendQuoteToUser(revisedQuote);
    } else {
      // Second decline - blacklist employee
      request.blacklistedEmployeeIds.push(employee.id);
      request.currentEmployeeId = null;
      this.activeRequests.set(request.id, request);
      
      // Requeue request
      this.requestQueue.push(request.id);
      this.processQueue();
    }
  }

  // User accepts quote
  async handleAccept(quote: PriceQuote) {
    const request = this.activeRequests.get(quote.requestId)!;
    request.status = 'accepted';
    this.activeRequests.set(request.id, request);

    // Start employee movement
    this.simulateEmployeeMovement(request);
  }

  private async simulateEmployeeMovement(request: Request) {
    const employee = this.employees.find(e => e.id === request.currentEmployeeId)!;
    
    // Simulate travel time (5 seconds)
    setTimeout(async () => {
      request.status = 'in_progress';
      this.activeRequests.set(request.id, request);

      // Complete request after arrival
      setTimeout(() => this.completeRequest(request.id), 2000);
    }, 5000);
  }

  private async completeRequest(requestId: string) {
    const request = this.activeRequests.get(requestId)!;
    request.status = 'completed';
    this.activeRequests.delete(requestId);

    // Store in Supabase
    await this.storeFinishedRequest(request);
  }

  private async storeFinishedRequest(request: Request) {
    // User history
    await supabase
      .from('user_history')
      .insert({
        request_id: request.id,
        user_id: request.userId,
        employee_id: request.currentEmployeeId,
        completed_at: new Date().toISOString()
      });

    // Employee finished requests
    await supabase
      .from('employee_finished_requests')
      .insert({
        request_id: request.id,
        user_id: request.userId,
        employee_id: request.currentEmployeeId,
        completed_at: new Date().toISOString()
      });
    
    // Close related UI components (implementation specific)
    this.closeRequestWindows(request.id);
  }

  // UI related functions
  private sendQuoteToUser(quote: PriceQuote) {
    /* Implementation for showing quote in UI */
  }

  private closeRequestWindows(requestId: string) {
    /* Implementation for closing UI components */
  }
}

// Usage Example
const mockEmployees: Employee[] = [
  { id: 'emp1', name: 'John', location: { lat: 0, lng: 0 } },
  { id: 'emp2', name: 'Sarah', location: { lat: 0, lng: 0 } }
];

const manager = new RequestManager(mockEmployees);

// Simulate user flow
async function simulateUserFlow() {
  // User creates request
  const requestId = await manager.createRequest('user123');
  
  // Later when quote is received...
  // manager.handleAccept(quote);
  // or
  // manager.handleDecline(quote);
}