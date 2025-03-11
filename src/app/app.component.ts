import { Component, OnInit } from '@angular/core';
import { ContactService } from './contact.service';
import { Contact } from './contact.model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

// Debounced search imports (Option 2)
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Phonebook';
  contacts: Contact[] = [];
  contactForm: FormGroup;
  searchTerm: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  loading: boolean = true;

  // Subject for debounced search
  searchSubject: Subject<string> = new Subject<string>();

  constructor(private contactService: ContactService, private fb: FormBuilder) {
    this.contactForm = this.fb.group({
  name: ['', [Validators.required, Validators.maxLength(50)]],
  phoneNumber: ['', [Validators.required, Validators.maxLength(20)]],
  email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]]
});

  }

  get name() { return this.contactForm.get('name'); }
  get phoneNumber() { return this.contactForm.get('phoneNumber'); }
  get email() { return this.contactForm.get('email'); }

  ngOnInit() {
    this.loadContacts();

    // Set up the debounced search subject
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((term: string) => {
      this.searchTerm = term;
      this.executeSearch();
    });
  }

  loadContacts() {
    this.loading = true;
    this.contactService.getContacts().subscribe({
      next: (data) => {
        this.contacts = data;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load contacts: ' + err.message;
        this.loading = false;
      }
    });
  }

  onSubmit() {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.contactForm.valid) {
      const contactData = this.contactForm.value;
      this.contactService.addContact(contactData).subscribe(
        (response: string) => {
          // Show the success message and update list
          this.successMessage = response; // "Contact added successfully."
          // Clear search so that new contact appears in full list
          this.searchTerm = '';
          this.contactForm.reset();
          this.loadContacts();
           // Clear the success message after 3 seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
        },
        (error) => {
          this.errorMessage = error.error; // "Phone number already exists."
          // Optionally clear error message as well after a delay:
          setTimeout(() => {
            this.errorMessage = '';
          }, 3000);
        }
      );
    }
  }

  // The method that actually performs the search
  executeSearch() {
    this.loading = true;
    if (this.searchTerm.trim() === '') {
      this.loadContacts();
    } else {
      this.contactService.searchContacts(this.searchTerm).subscribe({
        next: (data) => {
          this.contacts = data;
          this.loading = false;
        },
        error: (err) => {
          this.errorMessage = 'Search failed: ' + err.message;
          this.loading = false;
        }
      });
    }
  }

  // Debounced search trigger: call this on each input change
  onSearchChange(term: string) {
    this.searchSubject.next(term);
  }

  onDelete(id: number) {
    if (confirm('Are you sure you want to delete this contact?')) {
      // Reset any previous messages
      this.successMessage = '';
      this.errorMessage = '';

      this.contactService.deleteContact(id).subscribe({
        next: (response: string) => {
          this.successMessage = response; // "Contact deleted successfully."
          this.loadContacts();
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (err) => {
          this.errorMessage = err.error;
          setTimeout(() => {
            this.errorMessage = '';
          }, 3000);
        }
      });
    }
  }
}
