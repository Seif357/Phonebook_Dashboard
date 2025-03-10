import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Contact } from './contact.model';

interface CreateContactDto {
  name: string;
  phoneNumber: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = 'https://localhost:7058/api/Contacts'; // Update port if needed

  constructor(private http: HttpClient) { }

  getContacts(): Observable<Contact[]> {
    return this.http.get<Contact[]>(this.apiUrl);
  }

 // In contact.service.ts
addContact(contactData: any): Observable<string> {
  return this.http.post('https://localhost:7058/api/Contacts', contactData, { responseType: 'text' });
}


deleteContact(id: number): Observable<string> {
  return this.http.delete(`https://localhost:7058/api/Contacts/${id}`, { responseType: 'text' });
}


  searchContacts(term: string): Observable<Contact[]> {
    return this.http.get<Contact[]>(`${this.apiUrl}/search?term=${term}`);
  }
}