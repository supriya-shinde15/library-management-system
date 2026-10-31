/**
 * ============================================================================
 * Central Library Management System - Core Object-Oriented Architecture & Engine
 * Academic Mini-Project: SE Computer Engineering
 * Course: Object-Oriented Programming and Computer Graphics (OOPSCG - 210243/210250)
 * ============================================================================
 * 
 * OOP PARADIGMS DEMONSTRATED:
 * 1. Classes & Objects: ES6 Classes with encapsulated state and constructors.
 * 2. Encapsulation: Private/protected member conventions (_name) with accessors (getters/setters).
 * 3. Inheritance: LibraryItem -> Book, Person -> Student.
 * 4. Polymorphism: getDetails() and getRole() overridden in subclasses.
 * 5. Abstraction: Library facade hiding storage mechanics, inventory management, and fine math.
 * 6. LocalStorage: W3C Web Storage serialization with static factory methods (fromJSON).
 */

'use strict';

/* ============================================================================
   1. OBJECT-ORIENTED CLASS HIERARCHY
   ============================================================================ */

/**
 * Abstract Base Class: LibraryItem
 * Demonstrates Abstraction and Base Class inheritance for all library media.
 */
class LibraryItem {
  constructor(id, title) {
    if (new.target === LibraryItem) {
      throw new TypeError("Cannot construct LibraryItem instances directly. It is an abstract class.");
    }
    this._id = id ? id.trim() : '';
    this._title = title ? title.trim() : '';
    this._addedDate = new Date().toISOString();
  }

  get id() { return this._id; }
  get title() { return this._title; }
  get addedDate() { return this._addedDate; }

  set title(newTitle) {
    if (!newTitle || newTitle.trim().length === 0) {
      throw new Error("Title cannot be empty.");
    }
    this._title = newTitle.trim();
  }

  /**
   * Abstract method to be overridden by subclasses (Polymorphism)
   */
  getDetails() {
    throw new Error("Abstract method 'getDetails()' must be implemented by subclass.");
  }
}

/**
 * Derived Class: Book
 * Inherits from LibraryItem, adds fields for author, ISBN, category, publisher, and copies.
 */
class Book extends LibraryItem {
  constructor(id, title, author, isbn, category, publisher, totalCopies, availableCopies, addedDate) {
    super(id, title);
    this._author = author ? author.trim() : '';
    this._isbn = isbn ? isbn.trim() : '';
    this._category = category || 'General Engineering';
    this._publisher = publisher ? publisher.trim() : 'Standard Academic Press';
    
    const parsedTotal = parseInt(totalCopies, 10) || 1;
    this._totalCopies = parsedTotal > 0 ? parsedTotal : 1;
    
    const parsedAvail = (availableCopies !== undefined && availableCopies !== null) 
      ? parseInt(availableCopies, 10) 
      : this._totalCopies;
    this._availableCopies = parsedAvail >= 0 ? parsedAvail : 0;

    if (addedDate) {
      this._addedDate = addedDate;
    }
  }

  // Encapsulated Getters
  get author() { return this._author; }
  get isbn() { return this._isbn; }
  get category() { return this._category; }
  get publisher() { return this._publisher; }
  get totalCopies() { return this._totalCopies; }
  get availableCopies() { return this._availableCopies; }

  // Setters with Business Rule Validations
  set author(value) { this._author = value.trim(); }
  set isbn(value) { this._isbn = value.trim(); }
  set category(value) { this._category = value; }
  set publisher(value) { this._publisher = value.trim(); }
  
  set totalCopies(newTotal) {
    const parsed = parseInt(newTotal, 10);
    if (isNaN(parsed) || parsed < 1) {
      throw new Error("Total copies must be at least 1.");
    }
    const copiesDifference = parsed - this._totalCopies;
    this._totalCopies = parsed;
    // Adjust available copies proportionately
    this._availableCopies = Math.max(0, this._availableCopies + copiesDifference);
  }

  set availableCopies(newAvail) {
    const parsed = parseInt(newAvail, 10);
    if (isNaN(parsed) || parsed < 0 || parsed > this._totalCopies) {
      throw new Error(`Available copies must be between 0 and ${this._totalCopies}.`);
    }
    this._availableCopies = parsed;
  }

  /**
   * Check if book has at least one copy in library
   */
  isAvailable() {
    return this._availableCopies > 0;
  }

  /**
   * Decrement available copies upon issuing
   */
  decrementCopies() {
    if (!this.isAvailable()) {
      return false;
    }
    this._availableCopies -= 1;
    return true;
  }

  /**
   * Increment available copies upon return
   */
  incrementCopies() {
    if (this._availableCopies < this._totalCopies) {
      this._availableCopies += 1;
      return true;
    }
    return false;
  }

  /**
   * Polymorphic implementation of getDetails()
   */
  getDetails() {
    return `[Book] ${this.title} by ${this.author} (ISBN: ${this.isbn}) - Avail: ${this.availableCopies}/${this.totalCopies}`;
  }

  /**
   * Serialize to plain JSON object for LocalStorage
   */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      author: this.author,
      isbn: this.isbn,
      category: this.category,
      publisher: this.publisher,
      totalCopies: this.totalCopies,
      availableCopies: this.availableCopies,
      addedDate: this.addedDate
    };
  }

  /**
   * Static Factory Method to reconstruct Book instance from plain object
   */
  static fromJSON(data) {
    return new Book(
      data.id,
      data.title,
      data.author,
      data.isbn,
      data.category,
      data.publisher,
      data.totalCopies,
      data.availableCopies,
      data.addedDate
    );
  }
}

/**
 * Base Class: Person
 * Encapsulates common contact and identity fields
 */
class Person {
  constructor(id, name, email, phone) {
    this._id = id ? id.trim() : '';
    this._name = name ? name.trim() : '';
    this._email = email ? email.trim() : '';
    this._phone = phone ? phone.trim() : '';
  }

  get id() { return this._id; }
  get name() { return this._name; }
  get email() { return this._email; }
  get phone() { return this._phone; }

  set name(val) { this._name = val.trim(); }
  set email(val) { this._email = val.trim(); }
  set phone(val) { this._phone = val.trim(); }

  getRole() {
    return "Member";
  }

  getDetails() {
    return `${this._name} (ID: ${this._id}) - ${this._email}`;
  }
}

/**
 * Derived Class: Student
 * Demonstrates Inheritance from Person, adding student academic credentials
 */
class Student extends Person {
  constructor(id, name, department, year, email, phone, prn, rollNo, registeredDate, issuedBooksCount = 0) {
    super(id, name, email, phone);
    this._department = department || 'Computer Engineering';
    this._year = year || 'SE';
    this._prn = prn ? prn.trim() : 'PRN-REG';
    this._rollNo = rollNo ? rollNo.trim() : '';
    this._registeredDate = registeredDate || new Date().toISOString();
    this._issuedBooksCount = parseInt(issuedBooksCount, 10) || 0;
  }

  get department() { return this._department; }
  get year() { return this._year; }
  get prn() { return this._prn; }
  get rollNo() { return this._rollNo; }
  get registeredDate() { return this._registeredDate; }
  get issuedBooksCount() { return this._issuedBooksCount; }

  set department(val) { this._department = val; }
  set year(val) { this._year = val; }
  set prn(val) { this._prn = val.trim(); }
  set rollNo(val) { this._rollNo = val.trim(); }

  incrementIssued() {
    this._issuedBooksCount += 1;
  }

  decrementIssued() {
    if (this._issuedBooksCount > 0) {
      this._issuedBooksCount -= 1;
    }
  }

  /**
   * Polymorphic Override of getRole()
   */
  getRole() {
    return `Student (${this.year} - ${this.department})`;
  }

  /**
   * Polymorphic Override of getDetails()
   */
  getDetails() {
    return `[Student] ${this.name} | PRN: ${this.prn} | Year: ${this.year} ${this.department} | Issued: ${this.issuedBooksCount}`;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      department: this.department,
      year: this.year,
      email: this.email,
      phone: this.phone,
      prn: this.prn,
      rollNo: this.rollNo,
      registeredDate: this.registeredDate,
      issuedBooksCount: this.issuedBooksCount
    };
  }

  static fromJSON(data) {
    return new Student(
      data.id,
      data.name,
      data.department,
      data.year,
      data.email,
      data.phone,
      data.prn,
      data.rollNo,
      data.registeredDate,
      data.issuedBooksCount
    );
  }
}

/**
 * Class: LibraryTransaction
 * Encapsulates the borrowing life-cycle, dates, fines, and return verification
 */
class LibraryTransaction {
  constructor(transactionId, bookId, bookTitle, studentId, studentName, issueDate, dueDate, returnDate = null, status = 'ISSUED', fineAmount = 0, overdueDays = 0, remarks = '') {
    this._transactionId = transactionId;
    this._bookId = bookId;
    this._bookTitle = bookTitle;
    this._studentId = studentId;
    this._studentName = studentName;
    this._issueDate = issueDate;
    this._dueDate = dueDate;
    this._returnDate = returnDate;
    this._status = status; // 'ISSUED' | 'RETURNED'
    this._fineAmount = parseFloat(fineAmount) || 0;
    this._overdueDays = parseInt(overdueDays, 10) || 0;
    this._remarks = remarks;
  }

  get transactionId() { return this._transactionId; }
  get bookId() { return this._bookId; }
  get bookTitle() { return this._bookTitle; }
  get studentId() { return this._studentId; }
  get studentName() { return this._studentName; }
  get issueDate() { return this._issueDate; }
  get dueDate() { return this._dueDate; }
  get returnDate() { return this._returnDate; }
  get status() { return this._status; }
  get fineAmount() { return this._fineAmount; }
  get overdueDays() { return this._overdueDays; }
  get remarks() { return this._remarks; }

  /**
   * Calculate overdue days based on a reference date (e.g. today or actual return date)
   */
  calculateOverdue(refDateStr) {
    const due = new Date(this._dueDate);
    const ref = refDateStr ? new Date(refDateStr) : new Date();
    
    // Normalize to midnight for fair day difference
    due.setHours(0, 0, 0, 0);
    ref.setHours(0, 0, 0, 0);

    const diffTime = ref.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }

  /**
   * Complete the return and calculate fine
   * @param {string} returnDateStr 
   * @param {number} dailyFineRate Demo rate (e.g. ₹5/day)
   */
  completeReturn(returnDateStr, dailyFineRate = 5) {
    this._returnDate = returnDateStr || new Date().toISOString().split('T')[0];
    this._status = 'RETURNED';
    this._overdueDays = this.calculateOverdue(this._returnDate);
    this._fineAmount = this._overdueDays * dailyFineRate;
    return {
      overdueDays: this._overdueDays,
      fineAmount: this._fineAmount
    };
  }

  toJSON() {
    return {
      transactionId: this.transactionId,
      bookId: this.bookId,
      bookTitle: this.bookTitle,
      studentId: this.studentId,
      studentName: this.studentName,
      issueDate: this.issueDate,
      dueDate: this.dueDate,
      returnDate: this.returnDate,
      status: this.status,
      fineAmount: this.fineAmount,
      overdueDays: this.overdueDays,
      remarks: this.remarks
    };
  }

  static fromJSON(data) {
    return new LibraryTransaction(
      data.transactionId,
      data.bookId,
      data.bookTitle,
      data.studentId,
      data.studentName,
      data.issueDate,
      data.dueDate,
      data.returnDate,
      data.status,
      data.fineAmount,
      data.overdueDays,
      data.remarks
    );
  }
}

/**
 * Class: Library
 * Central Facade & System Manager implementing all core library operations,
 * search, business logic, activity logging, and LocalStorage persistence.
 */
class Library {
  constructor(storageKey = 'LIBCORE_DATA_v1') {
    this._storageKey = storageKey;
    this._books = new Map();         // Map<bookId, Book>
    this._students = new Map();      // Map<studentId, Student>
    this._transactions = new Map();  // Map<transactionId, LibraryTransaction>
    this._activityLog = [];          // Array<{ id, type, title, timestamp, icon }>
    this._fineRate = 5.00;           // Demo parameter: ₹5 per day late
  }

  get fineRate() { return this._fineRate; }
  set fineRate(rate) { this._fineRate = Math.max(0, parseFloat(rate) || 5); }

  // --- CRUD: Books ---

  addBook(data) {
    const id = data.id.trim().toUpperCase();
    if (this._books.has(id)) {
      throw new Error(`Book with ID "${id}" already exists in the catalog.`);
    }
    const book = new Book(
      id,
      data.title,
      data.author,
      data.isbn,
      data.category,
      data.publisher,
      data.totalCopies,
      data.availableCopies || data.totalCopies
    );
    this._books.set(id, book);
    this._logActivity('book', `Added new title: "${book.title}" (${book.id})`);
    this.saveToStorage();
    return book;
  }

  updateBook(id, data) {
    const cleanId = id.trim().toUpperCase();
    if (!this._books.has(cleanId)) {
      throw new Error(`Book with ID "${cleanId}" not found.`);
    }
    const book = this._books.get(cleanId);
    
    // Check if new total copy count is valid compared to currently issued copies
    const issuedCopies = book.totalCopies - book.availableCopies;
    const newTotal = parseInt(data.totalCopies, 10);
    if (newTotal < issuedCopies) {
      throw new Error(`Cannot decrease total copies to ${newTotal}. Currently, ${issuedCopies} copies are issued to students.`);
    }

    book.title = data.title;
    book.author = data.author;
    book.isbn = data.isbn;
    book.category = data.category;
    book.publisher = data.publisher;
    book.totalCopies = newTotal;

    this._logActivity('book', `Updated book record: "${book.title}"`);
    this.saveToStorage();
    return book;
  }

  deleteBook(id) {
    const cleanId = id.trim().toUpperCase();
    if (!this._books.has(cleanId)) {
      throw new Error(`Book with ID "${cleanId}" not found.`);
    }
    const book = this._books.get(cleanId);
    
    // Ensure no copies are currently checked out
    const issuedCopies = book.totalCopies - book.availableCopies;
    if (issuedCopies > 0) {
      throw new Error(`Cannot delete "${book.title}". There are ${issuedCopies} copies currently issued to students. Have them returned first.`);
    }

    this._books.delete(cleanId);
    this._logActivity('book', `Deleted book: "${book.title}" (${cleanId})`);
    this.saveToStorage();
    return true;
  }

  getBook(id) {
    return this._books.get(id ? id.trim().toUpperCase() : '');
  }

  getAllBooks() {
    return Array.from(this._books.values());
  }

  // --- CRUD: Students ---

  registerStudent(data) {
    const id = data.id.trim().toUpperCase();
    if (this._students.has(id)) {
      throw new Error(`Student with ID "${id}" is already registered.`);
    }

    // Verify unique PRN
    const existingPrn = Array.from(this._students.values()).find(
      s => s.prn.toLowerCase() === data.prn.trim().toLowerCase()
    );
    if (existingPrn) {
      throw new Error(`A student with PRN "${data.prn}" already exists (${existingPrn.name}).`);
    }

    const student = new Student(
      id,
      data.name,
      data.department,
      data.year,
      data.email,
      data.phone,
      data.prn,
      data.rollNo
    );
    this._students.set(id, student);
    this._logActivity('student', `Enrolled student: ${student.name} (${student.id})`);
    this.saveToStorage();
    return student;
  }

  updateStudent(id, data) {
    const cleanId = id.trim().toUpperCase();
    if (!this._students.has(cleanId)) {
      throw new Error(`Student with ID "${cleanId}" not found.`);
    }
    const student = this._students.get(cleanId);

    // If PRN changed, verify unique
    if (data.prn && data.prn.trim().toLowerCase() !== student.prn.toLowerCase()) {
      const duplicatePrn = Array.from(this._students.values()).find(
        s => s.id !== cleanId && s.prn.toLowerCase() === data.prn.trim().toLowerCase()
      );
      if (duplicatePrn) {
        throw new Error(`PRN "${data.prn}" is already used by another student.`);
      }
      student.prn = data.prn;
    }

    student.name = data.name;
    student.department = data.department;
    student.year = data.year;
    student.email = data.email;
    student.phone = data.phone;
    if (data.rollNo) student.rollNo = data.rollNo;

    this._logActivity('student', `Updated profile of: ${student.name}`);
    this.saveToStorage();
    return student;
  }

  deleteStudent(id) {
    const cleanId = id.trim().toUpperCase();
    if (!this._students.has(cleanId)) {
      throw new Error(`Student with ID "${cleanId}" not found.`);
    }
    const student = this._students.get(cleanId);

    // Check if student currently has any unreturned books
    const hasActiveBorrows = Array.from(this._transactions.values()).some(
      t => t.studentId === cleanId && t.status === 'ISSUED'
    );
    if (hasActiveBorrows || student.issuedBooksCount > 0) {
      throw new Error(`Cannot delete student ${student.name}. They have active unreturned books.`);
    }

    this._students.delete(cleanId);
    this._logActivity('student', `Deleted student: ${student.name} (${cleanId})`);
    this.saveToStorage();
    return true;
  }

  getStudent(id) {
    return this._students.get(id ? id.trim().toUpperCase() : '');
  }

  getAllStudents() {
    return Array.from(this._students.values());
  }

  // --- Circulation: Issue & Return ---

  issueBook(studentId, bookId, issueDateStr, dueDateStr, remarks = '') {
    const student = this.getStudent(studentId);
    if (!student) {
      throw new Error("Invalid student selected.");
    }
    const book = this.getBook(bookId);
    if (!book) {
      throw new Error("Invalid book selected.");
    }

    if (!book.isAvailable()) {
      throw new Error(`"${book.title}" has 0 copies available right now.`);
    }

    // Check if this student already has this exact book issued
    const alreadyHolding = Array.from(this._transactions.values()).find(
      t => t.studentId === student.id && t.bookId === book.id && t.status === 'ISSUED'
    );
    if (alreadyHolding) {
      throw new Error(`Student ${student.name} already holds a copy of "${book.title}" (Txn: ${alreadyHolding.transactionId}).`);
    }

    // Decrement available copies
    book.decrementCopies();
    student.incrementIssued();

    // Create unique Transaction ID
    const txnId = 'TXN-' + Math.floor(100000 + Math.random() * 900000);
    const txn = new LibraryTransaction(
      txnId,
      book.id,
      book.title,
      student.id,
      student.name,
      issueDateStr,
      dueDateStr,
      null,
      'ISSUED',
      0,
      0,
      remarks
    );

    this._transactions.set(txnId, txn);
    this._logActivity('issue', `Issued "${book.title}" to ${student.name}`);
    this.saveToStorage();
    return txn;
  }

  returnBook(transactionId, returnDateStr) {
    if (!this._transactions.has(transactionId)) {
      throw new Error(`Transaction "${transactionId}" does not exist.`);
    }
    const txn = this._transactions.get(transactionId);
    if (txn.status === 'RETURNED') {
      throw new Error(`Transaction "${transactionId}" is already closed.`);
    }

    // Mark transaction returned and compute fine
    const result = txn.completeReturn(returnDateStr, this._fineRate);

    // Restock book copies
    const book = this.getBook(txn.bookId);
    if (book) {
      book.incrementCopies();
    }

    // Decrement student active borrowed count
    const student = this.getStudent(txn.studentId);
    if (student) {
      student.decrementIssued();
    }

    const fineNote = result.fineAmount > 0 ? ` (Late fine: ₹${result.fineAmount.toFixed(2)})` : '';
    this._logActivity('return', `Returned "${txn.bookTitle}" by ${txn.studentName}${fineNote}`);
    this.saveToStorage();
    return {
      transaction: txn,
      overdueDays: result.overdueDays,
      fineAmount: result.fineAmount
    };
  }

  getActiveTransactions() {
    return Array.from(this._transactions.values()).filter(t => t.status === 'ISSUED');
  }

  getOverdueTransactions() {
    const today = new Date().toISOString().split('T')[0];
    return this.getActiveTransactions().filter(t => t.calculateOverdue(today) > 0);
  }

  getAllTransactions() {
    return Array.from(this._transactions.values()).sort((a, b) => {
      return new Date(b.issueDate) - new Date(a.issueDate);
    });
  }

  getTransaction(id) {
    return this._transactions.get(id);
  }

  // --- Search & Filter Queries ---

  searchBooks(query = '', category = '', availability = 'all') {
    const cleanQuery = query.toLowerCase().trim();
    return this.getAllBooks().filter(book => {
      const matchesQuery = !cleanQuery ||
        book.title.toLowerCase().includes(cleanQuery) ||
        book.author.toLowerCase().includes(cleanQuery) ||
        book.isbn.toLowerCase().includes(cleanQuery) ||
        book.id.toLowerCase().includes(cleanQuery) ||
        book.category.toLowerCase().includes(cleanQuery);

      const matchesCat = !category || book.category === category;
      
      let matchesAvail = true;
      if (availability === 'available') matchesAvail = book.isAvailable();
      else if (availability === 'out_of_stock') matchesAvail = !book.isAvailable();

      return matchesQuery && matchesCat && matchesAvail;
    });
  }

  searchStudents(query = '', department = '', year = '') {
    const cleanQuery = query.toLowerCase().trim();
    return this.getAllStudents().filter(student => {
      const matchesQuery = !cleanQuery ||
        student.name.toLowerCase().includes(cleanQuery) ||
        student.id.toLowerCase().includes(cleanQuery) ||
        student.prn.toLowerCase().includes(cleanQuery) ||
        student.email.toLowerCase().includes(cleanQuery);

      const matchesDept = !department || student.department === department;
      const matchesYear = !year || student.year === year;

      return matchesQuery && matchesDept && matchesYear;
    });
  }

  getRecentlyAddedBooks(limit = 5) {
    return this.getAllBooks()
      .sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate))
      .slice(0, limit);
  }

  getRecentActivities(limit = 8) {
    return this._activityLog.slice(0, limit);
  }

  clearActivityLog() {
    this._activityLog = [];
    this.saveToStorage();
  }

  _logActivity(type, text) {
    const activity = {
      id: 'ACT-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      type: type, // 'book', 'student', 'issue', 'return'
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    this._activityLog.unshift(activity);
    if (this._activityLog.length > 50) {
      this._activityLog.pop();
    }
  }

  // --- Metrics Summary ---

  getStats() {
    const books = this.getAllBooks();
    const students = this.getAllStudents();
    const activeTxns = this.getActiveTransactions();
    const overdueTxns = this.getOverdueTransactions();

    const totalCopies = books.reduce((sum, b) => sum + b.totalCopies, 0);
    const availableCopies = books.reduce((sum, b) => sum + b.availableCopies, 0);

    return {
      totalTitles: books.length,
      totalCopies: totalCopies,
      availableCopies: availableCopies,
      availableTitles: books.filter(b => b.isAvailable()).length,
      issuedCopies: activeTxns.length,
      overdueCount: overdueTxns.length,
      totalStudents: students.length
    };
  }

  // --- LocalStorage Persistence & Sample Seeding ---

  saveToStorage() {
    try {
      const serialized = {
        books: Array.from(this._books.values()).map(b => b.toJSON()),
        students: Array.from(this._students.values()).map(s => s.toJSON()),
        transactions: Array.from(this._transactions.values()).map(t => t.toJSON()),
        activityLog: this._activityLog,
        fineRate: this._fineRate
      };
      localStorage.setItem(this._storageKey, JSON.stringify(serialized));
    } catch (e) {
      console.error("Failed to save to LocalStorage:", e);
    }
  }

  loadFromStorage() {
    try {
      const dataStr = localStorage.getItem(this._storageKey);
      if (!dataStr) {
        this.seedInitialSampleData();
        return false;
      }
      const data = JSON.parse(dataStr);
      
      this._books.clear();
      if (Array.isArray(data.books)) {
        data.books.forEach(b => this._books.set(b.id, Book.fromJSON(b)));
      }

      this._students.clear();
      if (Array.isArray(data.students)) {
        data.students.forEach(s => this._students.set(s.id, Student.fromJSON(s)));
      }

      this._transactions.clear();
      if (Array.isArray(data.transactions)) {
        data.transactions.forEach(t => this._transactions.set(t.transactionId, LibraryTransaction.fromJSON(t)));
      }

      this._activityLog = Array.isArray(data.activityLog) ? data.activityLog : [];
      this._fineRate = data.fineRate || 5.00;

      // If storage was empty or corrupt, seed
      if (this._books.size === 0 && this._students.size === 0) {
        this.seedInitialSampleData();
      }
      return true;
    } catch (e) {
      console.warn("Corrupt storage data encountered. Re-seeding clean sample data:", e);
      this.seedInitialSampleData();
      return false;
    }
  }

  seedInitialSampleData() {
    this._books.clear();
    this._students.clear();
    this._transactions.clear();
    this._activityLog = [];

    // Standard Second Year Computer Engineering Textbooks
    const sampleBooks = [
      new Book('BK-101', 'Object-Oriented Programming with C++', 'E. Balagurusamy', '978-0070669079', 'Object Oriented Programming', 'McGraw Hill India', 6, 5, '2026-09-01T10:00:00.000Z'),
      new Book('BK-102', 'Computer Graphics: Principles & Practice', 'Donald D. Hearn, M. Pauline Baker', '978-0136053583', 'Computer Graphics', 'Pearson Higher Education', 5, 4, '2026-09-05T11:30:00.000Z'),
      new Book('BK-103', 'Data Structures & Algorithms in C++', 'Michael T. Goodrich, Roberto Tamassia', '978-0470383278', 'Data Structures', 'John Wiley & Sons', 8, 7, '2026-09-10T09:15:00.000Z'),
      new Book('BK-104', 'Computer Organization and Architecture', 'William Stallings', '978-0134997193', 'Computer Architecture', 'Pearson Education', 4, 4, '2026-09-15T14:20:00.000Z'),
      new Book('BK-105', 'Discrete Mathematics & Its Applications', 'Kenneth H. Rosen', '978-0073383095', 'Mathematics', 'McGraw Hill', 7, 7, '2026-09-20T16:00:00.000Z'),
      new Book('BK-106', 'Introduction to Algorithms (CLRS)', 'Thomas H. Cormen, Charles E. Leiserson', '978-0262033848', 'Computer Science', 'MIT Press', 5, 5, '2026-10-01T12:00:00.000Z'),
      new Book('BK-107', 'Computer Graphics Using OpenGL', 'F.S. Hill Jr., Stephen M. Kelley', '978-0131496705', 'Computer Graphics', 'Prentice Hall', 3, 3, '2026-10-10T10:45:00.000Z')
    ];

    sampleBooks.forEach(b => this._books.set(b.id, b));

    // Sample Computer Engineering Students
    const sampleStudents = [
      new Student('STU-201', 'Aarav Sharma', 'Computer Engineering', 'SE', 'aarav.sharma@pict.edu', '9822014589', '72145892K', '21201', '2026-08-15', 1),
      new Student('STU-202', 'Ananya Deshmukh', 'Computer Engineering', 'SE', 'ananya.deshmukh@coep.edu', '9423187654', '72145914M', '21215', '2026-08-15', 1),
      new Student('STU-203', 'Rohan Kulkarni', 'Computer Engineering', 'TE', 'rohan.kulkarni@viit.edu', '9890451234', '72034189B', '31244', '2026-08-18', 1),
      new Student('STU-204', 'Snehal Patil', 'Information Technology', 'BE', 'snehal.patil@mit.edu', '9765432190', '71928374H', '41209', '2026-08-20', 0),
      new Student('STU-205', 'Tanmay Joshi', 'AI & Data Science', 'SE', 'tanmay.joshi@pvg.edu', '9850123987', '72148012C', '22108', '2026-08-22', 0)
    ];

    sampleStudents.forEach(s => this._students.set(s.id, s));

    // Sample Issues demonstrating normal and overdue scenarios
    const today = new Date();
    
    // Issue 1: Current active issue (On-time)
    const issueDate1 = new Date(today);
    issueDate1.setDate(today.getDate() - 5);
    const dueDate1 = new Date(issueDate1);
    dueDate1.setDate(issueDate1.getDate() + 14);

    const txn1 = new LibraryTransaction(
      'TXN-842910',
      'BK-101',
      'Object-Oriented Programming with C++',
      'STU-201',
      'Aarav Sharma',
      issueDate1.toISOString().split('T')[0],
      dueDate1.toISOString().split('T')[0],
      null,
      'ISSUED',
      0,
      0,
      'OOPSCG Lab Reference'
    );
    this._transactions.set(txn1.transactionId, txn1);

    // Issue 2: Intentionally OVERDUE issue by 4 days to immediately test and demonstrate fine calculation!
    const issueDate2 = new Date(today);
    issueDate2.setDate(today.getDate() - 18);
    const dueDate2 = new Date(today);
    dueDate2.setDate(today.getDate() - 4); // Due 4 days ago!

    const txn2 = new LibraryTransaction(
      'TXN-719304',
      'BK-102',
      'Computer Graphics: Principles & Practice',
      'STU-202',
      'Ananya Deshmukh',
      issueDate2.toISOString().split('T')[0],
      dueDate2.toISOString().split('T')[0],
      null,
      'ISSUED',
      0,
      0,
      'DDA Algorithm study'
    );
    this._transactions.set(txn2.transactionId, txn2);

    // Issue 3: Already Returned Transaction
    const issueDate3 = new Date(today);
    issueDate3.setDate(today.getDate() - 25);
    const dueDate3 = new Date(today);
    dueDate3.setDate(today.getDate() - 11);
    const retDate3 = new Date(today);
    retDate3.setDate(today.getDate() - 9);

    const txn3 = new LibraryTransaction(
      'TXN-551980',
      'BK-103',
      'Data Structures & Algorithms in C++',
      'STU-203',
      'Rohan Kulkarni',
      issueDate3.toISOString().split('T')[0],
      dueDate3.toISOString().split('T')[0],
      retDate3.toISOString().split('T')[0],
      'RETURNED',
      10.00,
      2,
      'Cleared'
    );
    this._transactions.set(txn3.transactionId, txn3);

    // Initial Activities
    this._activityLog = [
      { id: 'ACT-1', type: 'issue', text: 'Issued "Computer Graphics" to Ananya Deshmukh (Due 4 days ago)', timestamp: '10:15 AM' },
      { id: 'ACT-2', type: 'issue', text: 'Issued "Object-Oriented Programming" to Aarav Sharma', timestamp: '11:00 AM' },
      { id: 'ACT-3', type: 'book', text: 'Imported Computer Engineering textbook catalog', timestamp: '09:00 AM' }
    ];

    this.saveToStorage();
  }
}


/* ============================================================================
   2. COMPUTER GRAPHICS ENGINE (OOPSCG LAB)
   ============================================================================ */

/**
 * Class: CGVisualizer
 * Renders 2D Affine Transformations, DDA Line Algorithm, and Framebuffer models
 */
class CGVisualizer {
  constructor() {
    this.transformCanvas = document.getElementById('cgTransformCanvas');
    this.transformCtx = this.transformCanvas ? this.transformCanvas.getContext('2d') : null;

    this.ddaCanvas = document.getElementById('cgDdaCanvas');
    this.ddaCtx = this.ddaCanvas ? this.ddaCanvas.getContext('2d') : null;

    // Transformation parameters
    this.params = {
      tx: 0,
      ty: 0,
      rotDeg: 0,
      scale: 1.0,
      shx: 0
    };

    this.initEvents();
    this.renderTransform();
    this.computeAndRenderDDA();
    this.updateColorMixer();
  }

  initEvents() {
    // Tab switching in CG Lab
    const cgTabs = document.querySelectorAll('.cg-tab-btn');
    cgTabs.forEach(btn => {
      btn.addEventListener('click', () => {
        cgTabs.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const target = btn.getAttribute('data-cg-tab');
        document.querySelectorAll('.cg-tab-content').forEach(c => c.classList.remove('active'));
        const pane = document.getElementById(`cg-tab-${target}`);
        if (pane) pane.classList.add('active');
        
        // Re-render when switching
        if (target === 'transforms') this.renderTransform();
        if (target === 'dda') this.computeAndRenderDDA();
      });
    });

    // Transformation sliders
    const sliderTx = document.getElementById('sliderTx');
    const sliderTy = document.getElementById('sliderTy');
    const sliderRot = document.getElementById('sliderRot');
    const sliderScale = document.getElementById('sliderScale');
    const sliderShx = document.getElementById('sliderShx');

    const updateTx = (e) => {
      this.params.tx = parseInt(e.target.value, 10);
      document.getElementById('valTx').innerText = this.params.tx;
      this.renderTransform();
    };
    const updateTy = (e) => {
      this.params.ty = parseInt(e.target.value, 10);
      document.getElementById('valTy').innerText = this.params.ty;
      this.renderTransform();
    };
    const updateRot = (e) => {
      this.params.rotDeg = parseInt(e.target.value, 10);
      document.getElementById('valRot').innerText = this.params.rotDeg;
      this.renderTransform();
    };
    const updateScale = (e) => {
      this.params.scale = parseFloat(e.target.value);
      document.getElementById('valScale').innerText = this.params.scale.toFixed(1);
      this.renderTransform();
    };
    const updateShx = (e) => {
      this.params.shx = parseFloat(e.target.value);
      document.getElementById('valShx').innerText = this.params.shx.toFixed(1);
      this.renderTransform();
    };

    if (sliderTx) sliderTx.addEventListener('input', updateTx);
    if (sliderTy) sliderTy.addEventListener('input', updateTy);
    if (sliderRot) sliderRot.addEventListener('input', updateRot);
    if (sliderScale) sliderScale.addEventListener('input', updateScale);
    if (sliderShx) sliderShx.addEventListener('input', updateShx);

    // Reset button
    const btnReset = document.getElementById('btnResetTransform');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        this.params = { tx: 0, ty: 0, rotDeg: 0, scale: 1.0, shx: 0 };
        if (sliderTx) sliderTx.value = 0;
        if (sliderTy) sliderTy.value = 0;
        if (sliderRot) sliderRot.value = 0;
        if (sliderScale) sliderScale.value = 1.0;
        if (sliderShx) sliderShx.value = 0;
        document.getElementById('valTx').innerText = '0';
        document.getElementById('valTy').innerText = '0';
        document.getElementById('valRot').innerText = '0';
        document.getElementById('valScale').innerText = '1.0';
        document.getElementById('valShx').innerText = '0.0';
        this.renderTransform();
      });
    }

    // Cursor coordinate tracker on transform canvas
    if (this.transformCanvas) {
      this.transformCanvas.addEventListener('mousemove', (e) => {
        const rect = this.transformCanvas.getBoundingClientRect();
        const x = Math.round(e.clientX - rect.left);
        const y = Math.round(e.clientY - rect.top);
        document.getElementById('cgCanvasCoordX').innerText = x;
        document.getElementById('cgCanvasCoordY').innerText = y;
      });
    }

    // DDA Calculation Button
    const btnDDA = document.getElementById('btnCalculateDDA');
    if (btnDDA) {
      btnDDA.addEventListener('click', () => this.computeAndRenderDDA());
    }

    // Color Mixer Sliders
    const colR = document.getElementById('sliderColorR');
    const colG = document.getElementById('sliderColorG');
    const colB = document.getElementById('sliderColorB');
    [colR, colG, colB].forEach(slider => {
      if (slider) slider.addEventListener('input', () => this.updateColorMixer());
    });
  }

  renderTransform() {
    if (!this.transformCtx) return;
    const ctx = this.transformCtx;
    const w = this.transformCanvas.width;
    const h = this.transformCanvas.height;

    // Clear background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    // Draw grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Draw Cartesian Axes through center (280, 210)
    const centerX = w / 2;
    const centerY = h / 2;

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, h);
    ctx.moveTo(0, centerY);
    ctx.lineTo(w, centerY);
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = '#64748b';
    ctx.font = '10px "Fira Code", monospace';
    ctx.fillText('Origin (0,0) [Top-Left]', 8, 16);
    ctx.fillText(`Center (+X, +Y) (${centerX}, ${centerY})`, centerX + 8, centerY - 8);

    // Save context state for transformations
    ctx.save();

    // Translate to center pivot
    ctx.translate(centerX + this.params.tx, centerY + this.params.ty);
    
    // Apply Rotation
    const rad = (this.params.rotDeg * Math.PI) / 180;
    ctx.rotate(rad);

    // Apply Scaling
    ctx.scale(this.params.scale, this.params.scale);

    // Apply Shearing (via affine transform: setTransform / transform)
    // Canvas transform(a, b, c, d, e, f): c is horizontal shear
    if (this.params.shx !== 0) {
      ctx.transform(1, 0, this.params.shx, 1, 0, 0);
    }

    // Draw Vector Graphic: Stylized Library Book
    // Left Page
    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.roundRect(-80, -50, 75, 100, [6, 0, 0, 6]);
    ctx.fill();

    // Right Page
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.roundRect(5, -50, 75, 100, [0, 6, 6, 0]);
    ctx.fill();

    // Book Spine
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(-6, -52, 12, 104);

    // Page Ribbons & Lines
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    for (let i = -30; i <= 30; i += 15) {
      ctx.fillRect(-70, i, 55, 3);
      ctx.fillRect(15, i, 55, 3);
    }

    // Emblem Star in center of book
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();

    // Center Coordinate Dot
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Update 3x3 Homogeneous Matrix Math Display
    this.updateMatrixMath();
  }

  updateMatrixMath() {
    const matrixBox = document.getElementById('cgMatrixDisplay');
    if (!matrixBox) return;

    const rad = (this.params.rotDeg * Math.PI) / 180;
    const cosVal = (Math.cos(rad) * this.params.scale).toFixed(2);
    const sinVal = (Math.sin(rad) * this.params.scale).toFixed(2);
    const negSin = (-Math.sin(rad) * this.params.scale).toFixed(2);
    const tx = this.params.tx;
    const ty = this.params.ty;
    const shx = this.params.shx.toFixed(2);

    matrixBox.innerHTML = `
      <pre style="margin:0; line-height:1.4;">
[ x'  y'  1 ] = [ x  y  1 ] × ┌                                  ┐
                              │  ${cosVal.padStart(6)}   ${sinVal.padStart(6)}      0  │
                              │  ${negSin.padStart(6)}   ${(parseFloat(cosVal) + parseFloat(shx)).toFixed(2).padStart(6)}      0  │
                              │  ${String(tx).padStart(6)}   ${String(ty).padStart(6)}      1  │
                              └                                  ┘
      </pre>
    `;
  }

  computeAndRenderDDA() {
    if (!this.ddaCtx) return;
    const x1 = parseInt(document.getElementById('ddaX1').value, 10) || 2;
    const y1 = parseInt(document.getElementById('ddaY1').value, 10) || 3;
    const x2 = parseInt(document.getElementById('ddaX2').value, 10) || 24;
    const y2 = parseInt(document.getElementById('ddaY2').value, 10) || 16;

    const dx = x2 - x1;
    const dy = y2 - y1;
    const steps = Math.max(Math.abs(dx), Math.abs(dy));

    const xInc = steps === 0 ? 0 : dx / steps;
    const yInc = steps === 0 ? 0 : dy / steps;

    let curX = x1;
    let curY = y1;

    const stepRows = [];
    const plottedPixels = [];

    for (let k = 0; k <= steps; k++) {
      const plotX = Math.round(curX);
      const plotY = Math.round(curY);
      plottedPixels.push({ x: plotX, y: plotY });
      stepRows.push({
        k: k,
        exactX: curX.toFixed(2),
        exactY: curY.toFixed(2),
        plotX: plotX,
        plotY: plotY
      });
      curX += xInc;
      curY += yInc;
    }

    // Render Table
    const tbody = document.getElementById('ddaStepTableBody');
    if (tbody) {
      tbody.innerHTML = stepRows.map(r => `
        <tr>
          <td><strong>${r.k}</strong></td>
          <td>${r.exactX}</td>
          <td>${r.exactY}</td>
          <td><span class="badge badge-primary">(${r.plotX}, ${r.plotY})</span></td>
        </tr>
      `).join('');
    }

    const statsText = document.getElementById('ddaStatsText');
    if (statsText) {
      statsText.innerHTML = `&Delta;x=${dx}, &Delta;y=${dy} | Steps: <strong>${steps}</strong>`;
    }

    // Render on DDA Pixel Grid Canvas
    const ctx = this.ddaCtx;
    const w = this.ddaCanvas.width;
    const h = this.ddaCanvas.height;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    const cols = 28;
    const rows = 21;
    const cellW = w / cols;
    const cellH = h / rows;

    // Draw Grid Lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let c = 0; c <= cols; c++) {
      ctx.beginPath();
      ctx.moveTo(c * cellW, 0);
      ctx.lineTo(c * cellW, h);
      ctx.stroke();
    }
    for (let r = 0; r <= rows; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * cellH);
      ctx.lineTo(w, r * cellH);
      ctx.stroke();
    }

    // Fill Plotted Pixels
    plottedPixels.forEach((pix, idx) => {
      if (idx === 0) {
        ctx.fillStyle = '#10b981'; // Start: Green
      } else if (idx === plottedPixels.length - 1) {
        ctx.fillStyle = '#ef4444'; // End: Red
      } else {
        ctx.fillStyle = '#3b82f6'; // Line: Blue
      }
      ctx.fillRect(pix.x * cellW + 1, pix.y * cellH + 1, cellW - 2, cellH - 2);
    });

    // Draw Continuous Theoretical Line on top
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x1 * cellW + cellW / 2, y1 * cellH + cellH / 2);
    ctx.lineTo(x2 * cellW + cellW / 2, y2 * cellH + cellH / 2);
    ctx.stroke();
  }

  updateColorMixer() {
    const r = parseInt(document.getElementById('sliderColorR').value, 10);
    const g = parseInt(document.getElementById('sliderColorG').value, 10);
    const b = parseInt(document.getElementById('sliderColorB').value, 10);

    document.getElementById('valColorR').innerText = r;
    document.getElementById('valColorG').innerText = g;
    document.getElementById('valColorB').innerText = b;

    const hexR = r.toString(16).padStart(2, '0').toUpperCase();
    const hexG = g.toString(16).padStart(2, '0').toUpperCase();
    const hexB = b.toString(16).padStart(2, '0').toUpperCase();
    const hexCode = `#${hexR}${hexG}${hexB}`;

    const swatch = document.getElementById('colorSwatch');
    if (swatch) {
      swatch.style.backgroundColor = hexCode;
      document.getElementById('colorSwatchHex').innerText = `${hexCode} (RGB: ${r}, ${g}, ${b})`;
    }

    document.getElementById('byteHexR').innerText = hexR;
    document.getElementById('byteHexG').innerText = hexG;
    document.getElementById('byteHexB').innerText = hexB;
  }
}


/* ============================================================================
   3. USER INTERFACE CONTROLLER (DOM & EVENT ORCHESTRATION)
   ============================================================================ */

class UIController {
  constructor(library) {
    this.library = library;
    this.currentView = 'dashboard';
    this.currentReportType = 'all';

    // Pending delete action reference
    this.pendingDelete = null; // { type: 'book' | 'student', id: string }

    this.cacheDom();
    this.bindEvents();
    this.initClock();
    this.renderCurrentView();
  }

  cacheDom() {
    // Navigation
    this.sidebar = document.getElementById('sidebar');
    this.navItems = document.querySelectorAll('.nav-item');
    this.viewSections = document.querySelectorAll('.view-section');
    this.pageTitle = document.getElementById('pageTitle');
    this.pageSubtitle = document.getElementById('pageSubtitle');
    this.sidebarBookCount = document.getElementById('sidebarBookCount');
    this.sidebarStudentCount = document.getElementById('sidebarStudentCount');
    this.sidebarOverdueCount = document.getElementById('sidebarOverdueCount');

    // Dashboard Elements
    this.dashTotalBooks = document.getElementById('dashTotalBooks');
    this.dashTotalCopies = document.getElementById('dashTotalCopies');
    this.dashAvailableBooks = document.getElementById('dashAvailableBooks');
    this.dashIssuedBooks = document.getElementById('dashIssuedBooks');
    this.dashOverdueBooks = document.getElementById('dashOverdueBooks');
    this.dashTotalStudents = document.getElementById('dashTotalStudents');
    this.dashOverdueAlert = document.getElementById('dashOverdueAlert');
    this.dashOverdueMessage = document.getElementById('dashOverdueMessage');
    this.dashRecentBooksBody = document.getElementById('dashRecentBooksBody');
    this.dashActivityTimeline = document.getElementById('dashActivityTimeline');

    // Books Elements
    this.booksTableBody = document.getElementById('booksTableBody');
    this.booksEmptyState = document.getElementById('booksEmptyState');
    this.bookCountBadge = document.getElementById('bookCountBadge');
    this.bookSearchInput = document.getElementById('bookSearchInput');
    this.bookCategoryFilter = document.getElementById('bookCategoryFilter');
    this.bookAvailabilityFilter = document.getElementById('bookAvailabilityFilter');

    // Students Elements
    this.studentsTableBody = document.getElementById('studentsTableBody');
    this.studentsEmptyState = document.getElementById('studentsEmptyState');
    this.studentCountBadge = document.getElementById('studentCountBadge');
    this.studentSearchInput = document.getElementById('studentSearchInput');
    this.studentDeptFilter = document.getElementById('studentDeptFilter');
    this.studentYearFilter = document.getElementById('studentYearFilter');

    // Issue Elements
    this.issueStudentSelect = document.getElementById('issueStudentSelect');
    this.issueBookSelect = document.getElementById('issueBookSelect');
    this.issueDateInput = document.getElementById('issueDateInput');
    this.dueDateInput = document.getElementById('dueDateInput');
    this.issueRemarksInput = document.getElementById('issueRemarksInput');
    this.issueBookForm = document.getElementById('issueBookForm');
    this.activeIssueTableBody = document.getElementById('activeIssueTableBody');
    this.activeIssueEmptyState = document.getElementById('activeIssueEmptyState');
    this.activeIssueCountBadge = document.getElementById('activeIssueCountBadge');
    this.issueStudentPreview = document.getElementById('issueStudentPreview');
    this.issueBookPreview = document.getElementById('issueBookPreview');

    // Return Elements
    this.returnTransactionSelect = document.getElementById('returnTransactionSelect');
    this.returnCalcSheet = document.getElementById('returnCalcSheet');
    this.returnSelectPrompt = document.getElementById('returnSelectPrompt');
    this.returnActiveTableBody = document.getElementById('returnActiveTableBody');
    this.returnEmptyState = document.getElementById('returnEmptyState');
    this.returnDateInput = document.getElementById('returnDateInput');
    this.btnConfirmReturn = document.getElementById('btnConfirmReturn');

    // Reports Elements
    this.reportDataTable = document.getElementById('reportDataTable');
    this.reportTableHead = document.getElementById('reportTableHead');
    this.reportTableBody = document.getElementById('reportTableBody');
    this.reportEmptyState = document.getElementById('reportEmptyState');
    this.reportTotalItems = document.getElementById('reportTotalItems');
    this.reportTotalCopies = document.getElementById('reportTotalCopies');
    this.reportActiveCount = document.getElementById('reportActiveCount');
    this.reportFinesSum = document.getElementById('reportFinesSum');
    this.printReportTitle = document.getElementById('printReportTitle');
    this.printReportDate = document.getElementById('printReportDate');

    // Modals
    this.bookModal = document.getElementById('bookModal');
    this.bookForm = document.getElementById('bookForm');
    this.studentModal = document.getElementById('studentModal');
    this.studentForm = document.getElementById('studentForm');
    this.confirmModal = document.getElementById('confirmModal');
    this.receiptModal = document.getElementById('receiptModal');
    this.toastContainer = document.getElementById('toastContainer');
  }

  bindEvents() {
    // Navigation items
    this.navItems.forEach(item => {
      item.addEventListener('click', () => {
        const view = item.getAttribute('data-view');
        this.navigateTo(view);
      });
    });

    // Links with data-view-target
    document.querySelectorAll('[data-view-target]').forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.getAttribute('data-view-target');
        this.navigateTo(view);
      });
    });

    // Mobile Sidebar Toggles
    const toggleBtn = document.getElementById('sidebarToggleBtn');
    const closeBtn = document.getElementById('sidebarCloseBtn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        this.sidebar.classList.toggle('mobile-open');
      });
    }
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.sidebar.classList.remove('mobile-open');
      });
    }

    // Reset Data Button
    document.getElementById('btnResetData').addEventListener('click', () => {
      this.openConfirmModal(
        'Reset to Sample Data',
        'This will restore all original sample books, students, and circulation records. Any local changes will be replaced.',
        () => {
          this.library.seedInitialSampleData();
          this.renderCurrentView();
          this.showToast('success', 'Reset Complete', 'Loaded clean sample records.');
        }
      );
    });

    // Quick Action Buttons on Dashboard
    document.getElementById('dashQuickAddBook').addEventListener('click', () => this.openBookModal('add'));
    document.getElementById('dashQuickRegStudent').addEventListener('click', () => this.openStudentModal('add'));
    document.getElementById('dashQuickIssue').addEventListener('click', () => this.navigateTo('issue'));
    document.getElementById('dashQuickReturn').addEventListener('click', () => this.navigateTo('return'));
    document.getElementById('dashGoOverdueBtn').addEventListener('click', () => this.navigateTo('return'));

    // Clear Activity Log
    document.getElementById('dashClearActivityBtn').addEventListener('click', () => {
      this.library.clearActivityLog();
      this.renderActivityTimeline();
      this.showToast('info', 'Log Cleared', 'Recent activity stream reset.');
    });

    // Book Management Toolbar
    document.getElementById('btnOpenAddBookModal').addEventListener('click', () => this.openBookModal('add'));
    this.bookSearchInput.addEventListener('input', () => this.renderBooksTable());
    this.bookCategoryFilter.addEventListener('change', () => this.renderBooksTable());
    this.bookAvailabilityFilter.addEventListener('change', () => this.renderBooksTable());
    document.getElementById('btnResetBookFilters').addEventListener('click', () => {
      this.bookSearchInput.value = '';
      this.bookCategoryFilter.value = '';
      this.bookAvailabilityFilter.value = 'all';
      this.renderBooksTable();
    });
    document.getElementById('btnExportBooksCSV').addEventListener('click', () => this.exportBooksCSV());

    // Student Management Toolbar
    document.getElementById('btnOpenAddStudentModal').addEventListener('click', () => this.openStudentModal('add'));
    this.studentSearchInput.addEventListener('input', () => this.renderStudentsTable());
    this.studentDeptFilter.addEventListener('change', () => this.renderStudentsTable());
    this.studentYearFilter.addEventListener('change', () => this.renderStudentsTable());
    document.getElementById('btnResetStudentFilters').addEventListener('click', () => {
      this.studentSearchInput.value = '';
      this.studentDeptFilter.value = '';
      this.studentYearFilter.value = '';
      this.renderStudentsTable();
    });
    document.getElementById('btnExportStudentsCSV').addEventListener('click', () => this.exportStudentsCSV());

    // Book Form Submit
    this.bookForm.addEventListener('submit', (e) => this.handleBookFormSubmit(e));

    // Student Form Submit
    this.studentForm.addEventListener('submit', (e) => this.handleStudentFormSubmit(e));

    // Issue Book Form & Previews
    this.issueStudentSelect.addEventListener('change', () => this.updateIssueStudentPreview());
    this.issueBookSelect.addEventListener('change', () => this.updateIssueBookPreview());
    this.issueBookForm.addEventListener('submit', (e) => this.handleIssueSubmit(e));

    // Return Selection & Calculations
    this.returnTransactionSelect.addEventListener('change', () => this.handleReturnSelectChange());
    this.returnDateInput.addEventListener('change', () => this.updateReturnFinePreview());
    this.btnConfirmReturn.addEventListener('click', () => this.handleReturnSubmit());

    // Reports Tabs & Print
    document.querySelectorAll('.report-tab-btn').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.report-tab-btn').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentReportType = tab.getAttribute('data-report-type');
        this.renderReports();
      });
    });
    document.getElementById('btnPrintReport').addEventListener('click', () => {
      window.print();
    });

    // Modal Close Buttons (data-modal-close)
    document.querySelectorAll('[data-modal-close]').forEach(btn => {
      btn.addEventListener('click', () => {
        const modalId = btn.getAttribute('data-modal-close');
        this.closeModal(modalId);
      });
    });

    // Confirm Modal Execution Button
    document.getElementById('btnConfirmAction').addEventListener('click', () => {
      if (typeof this.pendingAction === 'function') {
        this.pendingAction();
      }
      this.closeModal('confirmModal');
    });
  }

  initClock() {
    const clockEl = document.getElementById('liveDateTime');
    const updateTime = () => {
      const now = new Date();
      const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      if (clockEl) {
        clockEl.innerText = now.toLocaleDateString('en-IN', options);
      }
    };
    updateTime();
    setInterval(updateTime, 30000);
  }

  navigateTo(viewName) {
    this.currentView = viewName;

    // Close mobile sidebar if open
    this.sidebar.classList.remove('mobile-open');

    // Update active nav item
    this.navItems.forEach(item => {
      if (item.getAttribute('data-view') === viewName) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Update active view section
    this.viewSections.forEach(section => {
      if (section.id === `view-${viewName}`) {
        section.classList.add('active');
      } else {
        section.classList.remove('active');
      }
    });

    // Update page title & subtitle
    const viewMeta = {
      dashboard: { title: 'Dashboard Overview', sub: 'Real-time statistics and circulation summary' },
      books: { title: 'Book Management Catalog', sub: 'Create, update, search, and manage physical book copies' },
      students: { title: 'Student Directory', sub: 'Enrolled students, PRN records, and active borrowing allowances' },
      issue: { title: 'Issue Book to Student', sub: 'Process new book checkouts with real-time stock verification' },
      return: { title: 'Return Desk & Late Fine Calculator', sub: 'Process book returns, assess overdue days, and collect late fees' },
      reports: { title: 'Library Reports & Analytics', sub: 'Generate and print official academic inventory records' },
      'cg-lab': { title: 'Computer Graphics Interactive Lab', sub: '2D Transformations, Homogeneous Matrices & DDA Rasterization (OOPSCG)' },
      documentation: { title: 'Academic Project Documentation', sub: 'Full SE Computer Engineering mini-project documentation' }
    };

    if (viewMeta[viewName]) {
      this.pageTitle.innerText = viewMeta[viewName].title;
      this.pageSubtitle.innerText = viewMeta[viewName].sub;
    }

    this.renderCurrentView();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  renderCurrentView() {
    this.updateBadges();

    switch (this.currentView) {
      case 'dashboard':
        this.renderDashboard();
        break;
      case 'books':
        this.renderBooksTable();
        break;
      case 'students':
        this.renderStudentsTable();
        break;
      case 'issue':
        this.populateIssueDropdowns();
        this.renderActiveIssuesTable();
        break;
      case 'return':
        this.populateReturnDropdown();
        this.renderReturnActiveTable();
        break;
      case 'reports':
        this.renderReports();
        break;
    }
  }

  updateBadges() {
    const stats = this.library.getStats();
    if (this.sidebarBookCount) this.sidebarBookCount.innerText = stats.totalTitles;
    if (this.sidebarStudentCount) this.sidebarStudentCount.innerText = stats.totalStudents;
    
    if (this.sidebarOverdueCount) {
      if (stats.overdueCount > 0) {
        this.sidebarOverdueCount.innerText = `${stats.overdueCount} Overdue`;
        this.sidebarOverdueCount.style.display = 'inline-block';
      } else {
        this.sidebarOverdueCount.style.display = 'none';
      }
    }
  }

  // --- View 1: Dashboard Rendering ---

  renderDashboard() {
    const stats = this.library.getStats();

    this.dashTotalBooks.innerText = stats.totalTitles;
    this.dashTotalCopies.innerText = `${stats.totalCopies} total physical copies`;
    this.dashAvailableBooks.innerText = stats.availableCopies;
    this.dashIssuedBooks.innerText = stats.issuedCopies;
    this.dashOverdueBooks.innerText = `${stats.overdueCount} overdue`;
    this.dashTotalStudents.innerText = stats.totalStudents;

    // Overdue Alert Banner
    if (stats.overdueCount > 0) {
      this.dashOverdueAlert.style.display = 'flex';
      this.dashOverdueMessage.innerText = `There are ${stats.overdueCount} overdue book issue(s) exceeding the 14-day return period.`;
    } else {
      this.dashOverdueAlert.style.display = 'none';
    }

    // Recently Added Books Table
    const recentBooks = this.library.getRecentlyAddedBooks(5);
    this.dashRecentBooksBody.innerHTML = recentBooks.map(b => `
      <tr>
        <td>
          <span class="table-title">${this.escapeHTML(b.title)}</span>
          <span class="table-sub">${this.escapeHTML(b.author)} • ${this.escapeHTML(b.id)}</span>
        </td>
        <td><span class="badge badge-neutral">${this.escapeHTML(b.category)}</span></td>
        <td>
          <span class="badge ${b.isAvailable() ? 'badge-success' : 'badge-danger'}">
            ${b.availableCopies} / ${b.totalCopies} copies
          </span>
        </td>
        <td class="text-right">
          <button class="btn btn-outline btn-sm" onclick="app.quickIssueBook('${b.id}')" ${!b.isAvailable() ? 'disabled' : ''}>
            <i class="fa-solid fa-arrow-up-from-bracket"></i> Issue
          </button>
        </td>
      </tr>
    `).join('');

    // Activity Stream
    this.renderActivityTimeline();
  }

  renderActivityTimeline() {
    const activities = this.library.getRecentActivities(7);
    if (!activities || activities.length === 0) {
      this.dashActivityTimeline.innerHTML = `
        <div class="empty-state p-3">
          <p class="text-muted">No activities logged yet.</p>
        </div>
      `;
      return;
    }

    const typeIcons = {
      book: { icon: 'fa-book', class: 'act-book' },
      student: { icon: 'fa-user-graduate', class: 'act-student' },
      issue: { icon: 'fa-arrow-up-from-bracket', class: 'act-issue' },
      return: { icon: 'fa-arrow-down-to-bracket', class: 'act-return' }
    };

    this.dashActivityTimeline.innerHTML = activities.map(act => {
      const iconMeta = typeIcons[act.type] || { icon: 'fa-circle-info', class: 'act-book' };
      return `
        <div class="activity-item">
          <div class="act-icon ${iconMeta.class}">
            <i class="fa-solid ${iconMeta.icon}"></i>
          </div>
          <div class="act-details">
            <p>${this.escapeHTML(act.text)}</p>
            <span class="act-time"><i class="fa-regular fa-clock"></i> ${act.timestamp}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  // --- View 2: Books Table & CRUD ---

  renderBooksTable() {
    const query = this.bookSearchInput.value;
    const category = this.bookCategoryFilter.value;
    const avail = this.bookAvailabilityFilter.value;

    const books = this.library.searchBooks(query, category, avail);
    this.bookCountBadge.innerText = `Showing ${books.length} of ${this.library.getAllBooks().length} books`;

    if (books.length === 0) {
      this.booksTableBody.innerHTML = '';
      this.booksEmptyState.style.display = 'block';
      return;
    }

    this.booksEmptyState.style.display = 'none';
    this.booksTableBody.innerHTML = books.map(book => {
      const isAvail = book.isAvailable();
      return `
        <tr>
          <td><code>${this.escapeHTML(book.id)}</code></td>
          <td>
            <span class="table-title">${this.escapeHTML(book.title)}</span>
            <span class="table-sub">${this.escapeHTML(book.publisher)}</span>
          </td>
          <td>${this.escapeHTML(book.author)}</td>
          <td><span class="badge badge-neutral">${this.escapeHTML(book.category)}</span></td>
          <td><code class="text-muted">${this.escapeHTML(book.isbn)}</code></td>
          <td class="text-center font-weight-bold">${book.totalCopies}</td>
          <td class="text-center">
            <span class="badge ${isAvail ? 'badge-success' : 'badge-danger'}">
              ${book.availableCopies} Left
            </span>
          </td>
          <td>
            <span class="badge ${isAvail ? 'badge-success' : 'badge-danger'}">
              <i class="fa-solid ${isAvail ? 'fa-check' : 'fa-xmark'}"></i>
              ${isAvail ? 'In Stock' : 'Out of Stock'}
            </span>
          </td>
          <td class="text-right">
            <div class="btn-action-group">
              <button class="btn-action" title="Issue Book" onclick="app.quickIssueBook('${book.id}')" ${!isAvail ? 'disabled' : ''}>
                <i class="fa-solid fa-arrow-up-from-bracket"></i>
              </button>
              <button class="btn-action" title="Edit Book" onclick="app.openBookModal('edit', '${book.id}')">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button class="btn-action btn-action-delete" title="Delete Book" onclick="app.promptDeleteBook('${book.id}')">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  openBookModal(mode = 'add', bookId = null) {
    document.getElementById('bookFormMode').value = mode;
    const modalTitle = document.getElementById('bookModalTitle');
    const idInput = document.getElementById('bookIdInput');

    if (mode === 'add') {
      modalTitle.innerHTML = '<i class="fa-solid fa-book"></i> Add New Book to Catalog';
      this.bookForm.reset();
      idInput.readOnly = false;
      // Auto-suggest next ID
      const nextNum = 100 + this.library.getAllBooks().length + 1;
      idInput.value = `BK-${nextNum}`;
      document.getElementById('bookCopiesInput').value = 5;
    } else {
      modalTitle.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Edit Book Details';
      const book = this.library.getBook(bookId);
      if (!book) return;

      idInput.value = book.id;
      idInput.readOnly = true; // Book ID cannot change
      document.getElementById('bookTitleInput').value = book.title;
      document.getElementById('bookAuthorInput').value = book.author;
      document.getElementById('bookIsbnInput').value = book.isbn;
      document.getElementById('bookCategorySelect').value = book.category;
      document.getElementById('bookPublisherInput').value = book.publisher;
      document.getElementById('bookCopiesInput').value = book.totalCopies;
    }

    this.openModal('bookModal');
  }

  handleBookFormSubmit(e) {
    e.preventDefault();
    const mode = document.getElementById('bookFormMode').value;
    const id = document.getElementById('bookIdInput').value.trim();
    const title = document.getElementById('bookTitleInput').value.trim();
    const author = document.getElementById('bookAuthorInput').value.trim();
    const isbn = document.getElementById('bookIsbnInput').value.trim();
    const category = document.getElementById('bookCategorySelect').value;
    const publisher = document.getElementById('bookPublisherInput').value.trim();
    const totalCopies = parseInt(document.getElementById('bookCopiesInput').value, 10);

    // Validations
    if (!id || !title || !author || !isbn) {
      this.showToast('danger', 'Validation Error', 'Please fill in all required fields marked with *');
      return;
    }
    if (isNaN(totalCopies) || totalCopies < 1) {
      this.showToast('danger', 'Invalid Copies', 'Total copies must be a positive integer.');
      return;
    }

    try {
      if (mode === 'add') {
        this.library.addBook({
          id, title, author, isbn, category, publisher, totalCopies
        });
        this.showToast('success', 'Book Registered', `Successfully added "${title}" to library catalog.`);
      } else {
        this.library.updateBook(id, {
          title, author, isbn, category, publisher, totalCopies
        });
        this.showToast('success', 'Book Updated', `Successfully updated "${title}".`);
      }

      this.closeModal('bookModal');
      this.renderCurrentView();
    } catch (err) {
      this.showToast('danger', 'Error Saving Book', err.message);
    }
  }

  promptDeleteBook(bookId) {
    const book = this.library.getBook(bookId);
    if (!book) return;

    this.openConfirmModal(
      'Delete Book Record',
      `Are you sure you want to permanently remove "${book.title}" (${book.id}) from the library catalog?`,
      () => {
        try {
          this.library.deleteBook(bookId);
          this.showToast('success', 'Book Deleted', `Removed "${book.title}" from catalog.`);
          this.renderCurrentView();
        } catch (err) {
          this.showToast('danger', 'Cannot Delete Book', err.message);
        }
      }
    );
  }

  exportBooksCSV() {
    const books = this.library.getAllBooks();
    let csv = 'Book ID,Title,Author,ISBN,Category,Publisher,Total Copies,Available Copies\n';
    books.forEach(b => {
      csv += `"${b.id}","${b.title.replace(/"/g, '""')}","${b.author.replace(/"/g, '""')}","${b.isbn}","${b.category}","${b.publisher.replace(/"/g, '""')}",${b.totalCopies},${b.availableCopies}\n`;
    });
    this.downloadCSV(csv, 'Library_Book_Catalog.csv');
  }

  // --- View 3: Students Table & CRUD ---

  renderStudentsTable() {
    const query = this.studentSearchInput.value;
    const dept = this.studentDeptFilter.value;
    const year = this.studentYearFilter.value;

    const students = this.library.searchStudents(query, dept, year);
    this.studentCountBadge.innerText = `Showing ${students.length} of ${this.library.getAllStudents().length} students`;

    if (students.length === 0) {
      this.studentsTableBody.innerHTML = '';
      this.studentsEmptyState.style.display = 'block';
      return;
    }

    this.studentsEmptyState.style.display = 'none';
    this.studentsTableBody.innerHTML = students.map(student => {
      return `
        <tr>
          <td><code>${this.escapeHTML(student.id)}</code></td>
          <td>
            <span class="table-title">${this.escapeHTML(student.name)}</span>
            <span class="table-sub">${this.escapeHTML(student.getRole())}</span>
          </td>
          <td>
            <span class="badge badge-primary">${this.escapeHTML(student.year)}</span>
            <span class="table-sub">${this.escapeHTML(student.department)}</span>
          </td>
          <td>
            <code>${this.escapeHTML(student.prn)}</code>
            <span class="table-sub">Roll: ${student.rollNo || 'N/A'}</span>
          </td>
          <td>
            <span>${this.escapeHTML(student.email)}</span>
            <span class="table-sub"><i class="fa-solid fa-phone"></i> ${this.escapeHTML(student.phone)}</span>
          </td>
          <td class="text-center">
            <span class="badge ${student.issuedBooksCount > 0 ? 'badge-warning' : 'badge-neutral'}">
              ${student.issuedBooksCount} Active
            </span>
          </td>
          <td class="text-right">
            <div class="btn-action-group">
              <button class="btn-action" title="Edit Student" onclick="app.openStudentModal('edit', '${student.id}')">
                <i class="fa-solid fa-user-pen"></i>
              </button>
              <button class="btn-action btn-action-delete" title="Delete Student" onclick="app.promptDeleteStudent('${student.id}')">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  openStudentModal(mode = 'add', studentId = null) {
    document.getElementById('studentFormMode').value = mode;
    const modalTitle = document.getElementById('studentModalTitle');
    const idInput = document.getElementById('studentIdInput');

    if (mode === 'add') {
      modalTitle.innerHTML = '<i class="fa-solid fa-user-graduate"></i> Register New Student';
      this.studentForm.reset();
      idInput.readOnly = false;
      const nextNum = 200 + this.library.getAllStudents().length + 1;
      idInput.value = `STU-${nextNum}`;
    } else {
      modalTitle.innerHTML = '<i class="fa-solid fa-user-pen"></i> Edit Student Record';
      const student = this.library.getStudent(studentId);
      if (!student) return;

      idInput.value = student.id;
      idInput.readOnly = true;
      document.getElementById('studentNameInput').value = student.name;
      document.getElementById('studentPrnInput').value = student.prn;
      document.getElementById('studentDeptSelect').value = student.department;
      document.getElementById('studentYearSelect').value = student.year;
      document.getElementById('studentEmailInput').value = student.email;
      document.getElementById('studentPhoneInput').value = student.phone;
    }

    this.openModal('studentModal');
  }

  handleStudentFormSubmit(e) {
    e.preventDefault();
    const mode = document.getElementById('studentFormMode').value;
    const id = document.getElementById('studentIdInput').value.trim();
    const name = document.getElementById('studentNameInput').value.trim();
    const prn = document.getElementById('studentPrnInput').value.trim();
    const department = document.getElementById('studentDeptSelect').value;
    const year = document.getElementById('studentYearSelect').value;
    const email = document.getElementById('studentEmailInput').value.trim();
    const phone = document.getElementById('studentPhoneInput').value.trim();

    if (!id || !name || !prn || !email || !phone) {
      this.showToast('danger', 'Validation Error', 'Please complete all required student fields.');
      return;
    }

    try {
      if (mode === 'add') {
        this.library.registerStudent({
          id, name, department, year, email, phone, prn
        });
        this.showToast('success', 'Student Enrolled', `Registered ${name} in ${year} ${department}.`);
      } else {
        this.library.updateStudent(id, {
          name, department, year, email, phone, prn
        });
        this.showToast('success', 'Record Updated', `Successfully updated profile of ${name}.`);
      }

      this.closeModal('studentModal');
      this.renderCurrentView();
    } catch (err) {
      this.showToast('danger', 'Error Saving Student', err.message);
    }
  }

  promptDeleteStudent(studentId) {
    const student = this.library.getStudent(studentId);
    if (!student) return;

    this.openConfirmModal(
      'Delete Student Record',
      `Are you sure you want to delete ${student.name} (${student.id}) from the student registry?`,
      () => {
        try {
          this.library.deleteStudent(studentId);
          this.showToast('success', 'Student Deleted', `Removed ${student.name} from records.`);
          this.renderCurrentView();
        } catch (err) {
          this.showToast('danger', 'Cannot Delete Student', err.message);
        }
      }
    );
  }

  exportStudentsCSV() {
    const students = this.library.getAllStudents();
    let csv = 'Student ID,Full Name,Department,Year,PRN,Email,Phone,Issued Books\n';
    students.forEach(s => {
      csv += `"${s.id}","${s.name.replace(/"/g, '""')}","${s.department}","${s.year}","${s.prn}","${s.email}","${s.phone}",${s.issuedBooksCount}\n`;
    });
    this.downloadCSV(csv, 'Library_Enrolled_Students.csv');
  }

  // --- View 4: Issue Book ---

  populateIssueDropdowns(preselectedBookId = null) {
    // Populate Students
    const students = this.library.getAllStudents();
    this.issueStudentSelect.innerHTML = '<option value="">-- Choose Student --</option>' +
      students.map(s => `
        <option value="${s.id}">
          ${s.name} (${s.id} • ${s.year} ${s.department} • PRN: ${s.prn})
        </option>
      `).join('');

    // Populate Books (only available ones)
    const books = this.library.getAllBooks();
    this.issueBookSelect.innerHTML = '<option value="">-- Choose Book --</option>' +
      books.map(b => `
        <option value="${b.id}" ${b.availableCopies === 0 ? 'disabled' : ''} ${preselectedBookId === b.id ? 'selected' : ''}>
          ${b.title} [${b.id}] (${b.availableCopies} available of ${b.totalCopies})
        </option>
      `).join('');

    // Set Default Dates: Issue = Today, Due = Today + 14 days
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 14);

    this.issueDateInput.value = today.toISOString().split('T')[0];
    this.dueDateInput.value = dueDate.toISOString().split('T')[0];

    this.updateIssueStudentPreview();
    this.updateIssueBookPreview();
  }

  updateIssueStudentPreview() {
    const studentId = this.issueStudentSelect.value;
    const student = this.library.getStudent(studentId);
    if (!student) {
      this.issueStudentPreview.style.display = 'none';
      return;
    }
    this.issueStudentPreview.style.display = 'flex';
    document.getElementById('previewStudentName').innerText = student.name;
    document.getElementById('previewStudentMeta').innerText = `${student.year} ${student.department} • PRN: ${student.prn}`;
    document.getElementById('previewStudentIssuedCount').innerText = `Currently has ${student.issuedBooksCount} book(s) checked out`;
  }

  updateIssueBookPreview() {
    const bookId = this.issueBookSelect.value;
    const book = this.library.getBook(bookId);
    if (!book) {
      this.issueBookPreview.style.display = 'none';
      return;
    }
    this.issueBookPreview.style.display = 'flex';
    document.getElementById('previewBookTitle').innerText = book.title;
    document.getElementById('previewBookAuthor').innerText = `By ${book.author} • Category: ${book.category}`;
    document.getElementById('previewBookCopies').innerText = `${book.availableCopies} Copies Available in Stock (Total: ${book.totalCopies})`;
  }

  handleIssueSubmit(e) {
    e.preventDefault();
    const studentId = this.issueStudentSelect.value;
    const bookId = this.issueBookSelect.value;
    const issueDate = this.issueDateInput.value;
    const dueDate = this.dueDateInput.value;
    const remarks = this.issueRemarksInput.value.trim();

    if (!studentId || !bookId || !issueDate || !dueDate) {
      this.showToast('danger', 'Incomplete Form', 'Please choose student, book, and verified dates.');
      return;
    }

    try {
      const txn = this.library.issueBook(studentId, bookId, issueDate, dueDate, remarks);
      this.showToast('success', 'Book Issued Successfully', `Issued "${txn.bookTitle}" to ${txn.studentName}.`);
      this.issueBookForm.reset();
      this.populateIssueDropdowns();
      this.renderActiveIssuesTable();
    } catch (err) {
      this.showToast('danger', 'Issue Failed', err.message);
    }
  }

  quickIssueBook(bookId) {
    this.navigateTo('issue');
    this.populateIssueDropdowns(bookId);
  }

  renderActiveIssuesTable() {
    const active = this.library.getActiveTransactions();
    this.activeIssueCountBadge.innerText = `${active.length} Active`;

    if (active.length === 0) {
      this.activeIssueTableBody.innerHTML = '';
      this.activeIssueEmptyState.style.display = 'block';
      return;
    }

    this.activeIssueEmptyState.style.display = 'none';
    const today = new Date().toISOString().split('T')[0];

    this.activeIssueTableBody.innerHTML = active.map(txn => {
      const overdueDays = txn.calculateOverdue(today);
      const isOverdue = overdueDays > 0;
      return `
        <tr>
          <td>
            <span class="table-title">${this.escapeHTML(txn.bookTitle)}</span>
            <span class="table-sub"><i class="fa-solid fa-user-graduate"></i> ${this.escapeHTML(txn.studentName)} (${txn.studentId})</span>
          </td>
          <td>
            <div><small class="text-muted">Issued:</small> ${txn.issueDate}</div>
            <div><small class="text-muted">Due:</small> <strong>${txn.dueDate}</strong></div>
          </td>
          <td>
            ${isOverdue
              ? `<span class="badge badge-danger"><i class="fa-solid fa-triangle-exclamation"></i> ${overdueDays}d Late</span>`
              : `<span class="badge badge-success"><i class="fa-solid fa-clock"></i> Active</span>`
            }
          </td>
          <td class="text-right">
            <button class="btn btn-outline btn-sm" onclick="app.quickReturnTxn('${txn.transactionId}')">
              <i class="fa-solid fa-arrow-down-to-bracket"></i> Return
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  // --- View 5: Return Book & Fines ---

  populateReturnDropdown(preselectTxnId = null) {
    const active = this.library.getActiveTransactions();
    this.returnTransactionSelect.innerHTML = '<option value="">-- Select Active Issue Record --</option>' +
      active.map(t => `
        <option value="${t.transactionId}" ${preselectTxnId === t.transactionId ? 'selected' : ''}>
          ${t.bookTitle} &rarr; ${t.studentName} (Due: ${t.dueDate} • ${t.transactionId})
        </option>
      `).join('');

    // Set today as default return date
    this.returnDateInput.value = new Date().toISOString().split('T')[0];

    if (preselectTxnId) {
      this.handleReturnSelectChange();
    } else {
      this.returnCalcSheet.style.display = 'none';
      this.returnSelectPrompt.style.display = 'block';
    }
  }

  handleReturnSelectChange() {
    const txnId = this.returnTransactionSelect.value;
    const txn = this.library.getTransaction(txnId);
    if (!txn) {
      this.returnCalcSheet.style.display = 'none';
      this.returnSelectPrompt.style.display = 'block';
      return;
    }

    this.returnSelectPrompt.style.display = 'none';
    this.returnCalcSheet.style.display = 'block';

    document.getElementById('sheetTxnId').innerText = txn.transactionId;
    document.getElementById('sheetBookTitle').innerText = txn.bookTitle;
    document.getElementById('sheetStudentName').innerText = `${txn.studentName} (${txn.studentId})`;
    document.getElementById('sheetIssueDate').innerText = txn.issueDate;
    document.getElementById('sheetDueDate').innerText = txn.dueDate;

    this.updateReturnFinePreview();
  }

  updateReturnFinePreview() {
    const txnId = this.returnTransactionSelect.value;
    const txn = this.library.getTransaction(txnId);
    if (!txn) return;

    const returnDateStr = this.returnDateInput.value;
    const issueDate = new Date(txn.issueDate);
    const returnDate = new Date(returnDateStr);

    issueDate.setHours(0, 0, 0, 0);
    returnDate.setHours(0, 0, 0, 0);

    const diffDays = Math.max(0, Math.ceil((returnDate - issueDate) / (1000 * 60 * 60 * 24)));
    const overdueDays = txn.calculateOverdue(returnDateStr);
    const fineTotal = overdueDays * this.library.fineRate;

    document.getElementById('fineDaysTotal').innerText = `${diffDays} days`;
    document.getElementById('fineDaysOverdue').innerText = `${overdueDays} days`;
    
    const fineBadge = document.getElementById('fineTotalAmount');
    fineBadge.innerText = `₹${fineTotal.toFixed(2)}`;
    if (fineTotal > 0) {
      fineBadge.style.color = '#dc2626';
    } else {
      fineBadge.style.color = '#059669';
    }
  }

  handleReturnSubmit() {
    const txnId = this.returnTransactionSelect.value;
    if (!txnId) {
      this.showToast('danger', 'Error', 'Please choose an issue record to return.');
      return;
    }
    const returnDate = this.returnDateInput.value;

    try {
      const res = this.library.returnBook(txnId, returnDate);
      this.showReturnReceipt(res.transaction, res.overdueDays, res.fineAmount);
      this.populateReturnDropdown();
      this.renderReturnActiveTable();
    } catch (err) {
      this.showToast('danger', 'Return Error', err.message);
    }
  }

  showReturnReceipt(txn, overdueDays, fineAmount) {
    document.getElementById('receiptTxnId').innerText = txn.transactionId;
    document.getElementById('receiptBookTitle').innerText = txn.bookTitle;
    document.getElementById('receiptStudent').innerText = `${txn.studentName} (${txn.studentId})`;
    document.getElementById('receiptIssueDate').innerText = txn.issueDate;
    document.getElementById('receiptDueDate').innerText = txn.dueDate;
    document.getElementById('receiptReturnDate').innerText = txn.returnDate;
    document.getElementById('receiptOverdueDays').innerText = `${overdueDays} days`;
    document.getElementById('receiptFineAmount').innerText = `₹${fineAmount.toFixed(2)}`;

    this.openModal('receiptModal');
    this.showToast('success', 'Return Processed', `"${txn.bookTitle}" has been restocked in catalog.`);
  }

  quickReturnTxn(txnId) {
    this.navigateTo('return');
    this.populateReturnDropdown(txnId);
  }

  renderReturnActiveTable() {
    const active = this.library.getActiveTransactions();

    if (active.length === 0) {
      this.returnActiveTableBody.innerHTML = '';
      this.returnEmptyState.style.display = 'block';
      return;
    }

    this.returnEmptyState.style.display = 'none';
    const today = new Date().toISOString().split('T')[0];

    this.returnActiveTableBody.innerHTML = active.map(txn => {
      const overdue = txn.calculateOverdue(today);
      return `
        <tr>
          <td>
            <span class="table-title">${this.escapeHTML(txn.bookTitle)}</span>
            <span class="table-sub">${this.escapeHTML(txn.studentName)} (${txn.studentId})</span>
          </td>
          <td>${txn.dueDate}</td>
          <td>
            ${overdue > 0
              ? `<span class="badge badge-danger">${overdue}d Overdue (Fine: ₹${(overdue * this.library.fineRate).toFixed(2)})</span>`
              : `<span class="badge badge-success">On Schedule</span>`
            }
          </td>
          <td class="text-right">
            <button class="btn btn-primary btn-sm" onclick="app.populateReturnDropdown('${txn.transactionId}')">
              Select
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  // --- View 6: Reports & Analytics ---

  renderReports() {
    const today = new Date().toISOString().split('T')[0];
    this.printReportDate.innerText = new Date().toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const reportTitles = {
      all: 'All Books Repository Catalog',
      available: 'Currently Available In-Stock Inventory',
      issued: 'Active Borrowing Circulation Records',
      overdue: 'Overdue Borrowing Records & Fine Assessments',
      history: 'Complete Circulation & Return Transaction Audit'
    };
    this.printReportTitle.innerText = reportTitles[this.currentReportType] || 'Library Report';

    const stats = this.library.getStats();
    this.reportTotalCopies.innerText = stats.totalCopies;
    this.reportActiveCount.innerText = stats.issuedCopies;

    // Calculate total fines collected across history
    const allTxns = this.library.getAllTransactions();
    const sumFines = allTxns.reduce((sum, t) => sum + (t.fineAmount || 0), 0);
    this.reportFinesSum.innerText = `₹${sumFines.toFixed(2)}`;

    switch (this.currentReportType) {
      case 'all':
        this.renderAllBooksReport();
        break;
      case 'available':
        this.renderAvailableBooksReport();
        break;
      case 'issued':
        this.renderIssuedBooksReport();
        break;
      case 'overdue':
        this.renderOverdueBooksReport();
        break;
      case 'history':
        this.renderHistoryReport();
        break;
    }
  }

  renderAllBooksReport() {
    const books = this.library.getAllBooks();
    this.reportTotalItems.innerText = books.length;

    this.reportTableHead.innerHTML = `
      <tr>
        <th>Book ID</th>
        <th>Book Title</th>
        <th>Author</th>
        <th>Category</th>
        <th>ISBN</th>
        <th class="text-center">Total Copies</th>
        <th class="text-center">Available</th>
        <th>Status</th>
      </tr>
    `;

    if (books.length === 0) {
      this.reportTableBody.innerHTML = '';
      this.reportEmptyState.style.display = 'block';
      return;
    }
    this.reportEmptyState.style.display = 'none';

    this.reportTableBody.innerHTML = books.map(b => `
      <tr>
        <td><code>${this.escapeHTML(b.id)}</code></td>
        <td><strong>${this.escapeHTML(b.title)}</strong></td>
        <td>${this.escapeHTML(b.author)}</td>
        <td>${this.escapeHTML(b.category)}</td>
        <td><code>${this.escapeHTML(b.isbn)}</code></td>
        <td class="text-center">${b.totalCopies}</td>
        <td class="text-center">${b.availableCopies}</td>
        <td>
          <span class="badge ${b.isAvailable() ? 'badge-success' : 'badge-danger'}">
            ${b.isAvailable() ? 'In Stock' : 'Out of Stock'}
          </span>
        </td>
      </tr>
    `).join('');
  }

  renderAvailableBooksReport() {
    const books = this.library.getAllBooks().filter(b => b.isAvailable());
    this.reportTotalItems.innerText = books.length;

    this.reportTableHead.innerHTML = `
      <tr>
        <th>Book ID</th>
        <th>Book Title</th>
        <th>Author</th>
        <th>Category</th>
        <th class="text-center">Available Copies</th>
        <th class="text-center">Total Shelf Copies</th>
      </tr>
    `;

    if (books.length === 0) {
      this.reportTableBody.innerHTML = '';
      this.reportEmptyState.style.display = 'block';
      return;
    }
    this.reportEmptyState.style.display = 'none';

    this.reportTableBody.innerHTML = books.map(b => `
      <tr>
        <td><code>${this.escapeHTML(b.id)}</code></td>
        <td><strong>${this.escapeHTML(b.title)}</strong></td>
        <td>${this.escapeHTML(b.author)}</td>
        <td>${this.escapeHTML(b.category)}</td>
        <td class="text-center"><span class="badge badge-success">${b.availableCopies}</span></td>
        <td class="text-center">${b.totalCopies}</td>
      </tr>
    `).join('');
  }

  renderIssuedBooksReport() {
    const active = this.library.getActiveTransactions();
    this.reportTotalItems.innerText = active.length;

    this.reportTableHead.innerHTML = `
      <tr>
        <th>Txn ID</th>
        <th>Book Title</th>
        <th>Student Name</th>
        <th>Student ID</th>
        <th>Issue Date</th>
        <th>Due Date</th>
        <th>Circulation Status</th>
      </tr>
    `;

    if (active.length === 0) {
      this.reportTableBody.innerHTML = '';
      this.reportEmptyState.style.display = 'block';
      return;
    }
    this.reportEmptyState.style.display = 'none';

    const today = new Date().toISOString().split('T')[0];
    this.reportTableBody.innerHTML = active.map(t => {
      const isLate = t.calculateOverdue(today) > 0;
      return `
        <tr>
          <td><code>${t.transactionId}</code></td>
          <td><strong>${this.escapeHTML(t.bookTitle)}</strong></td>
          <td>${this.escapeHTML(t.studentName)}</td>
          <td><code>${t.studentId}</code></td>
          <td>${t.issueDate}</td>
          <td>${t.dueDate}</td>
          <td>
            <span class="badge ${isLate ? 'badge-danger' : 'badge-primary'}">
              ${isLate ? 'OVERDUE' : 'ISSUED'}
            </span>
          </td>
        </tr>
      `;
    }).join('');
  }

  renderOverdueBooksReport() {
    const overdue = this.library.getOverdueTransactions();
    this.reportTotalItems.innerText = overdue.length;

    this.reportTableHead.innerHTML = `
      <tr>
        <th>Txn ID</th>
        <th>Book Title</th>
        <th>Student Name</th>
        <th>Due Date</th>
        <th>Days Late</th>
        <th>Assessed Fine (₹5/day)</th>
        <th>Action</th>
      </tr>
    `;

    if (overdue.length === 0) {
      this.reportTableBody.innerHTML = '';
      this.reportEmptyState.style.display = 'block';
      return;
    }
    this.reportEmptyState.style.display = 'none';

    const today = new Date().toISOString().split('T')[0];
    this.reportTableBody.innerHTML = overdue.map(t => {
      const days = t.calculateOverdue(today);
      const fine = days * this.library.fineRate;
      return `
        <tr>
          <td><code>${t.transactionId}</code></td>
          <td><strong>${this.escapeHTML(t.bookTitle)}</strong></td>
          <td>${this.escapeHTML(t.studentName)}</td>
          <td><span class="text-danger font-weight-bold">${t.dueDate}</span></td>
          <td><span class="badge badge-danger">${days} days</span></td>
          <td><strong class="text-danger">₹${fine.toFixed(2)}</strong></td>
          <td class="text-right">
            <button class="btn btn-outline btn-sm" onclick="app.quickReturnTxn('${t.transactionId}')">
              Clear & Return
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  renderHistoryReport() {
    const txns = this.library.getAllTransactions();
    this.reportTotalItems.innerText = txns.length;

    this.reportTableHead.innerHTML = `
      <tr>
        <th>Txn ID</th>
        <th>Book Title</th>
        <th>Student</th>
        <th>Issue Date</th>
        <th>Due Date</th>
        <th>Return Date</th>
        <th>Status</th>
        <th>Fine Paid</th>
      </tr>
    `;

    if (txns.length === 0) {
      this.reportTableBody.innerHTML = '';
      this.reportEmptyState.style.display = 'block';
      return;
    }
    this.reportEmptyState.style.display = 'none';

    this.reportTableBody.innerHTML = txns.map(t => `
      <tr>
        <td><code>${t.transactionId}</code></td>
        <td><strong>${this.escapeHTML(t.bookTitle)}</strong></td>
        <td>${this.escapeHTML(t.studentName)}</td>
        <td>${t.issueDate}</td>
        <td>${t.dueDate}</td>
        <td>${t.returnDate || '<span class="text-muted">-</span>'}</td>
        <td>
          <span class="badge ${t.status === 'RETURNED' ? 'badge-success' : 'badge-warning'}">
            ${t.status}
          </span>
        </td>
        <td>${t.fineAmount > 0 ? `<strong class="text-danger">₹${t.fineAmount.toFixed(2)}</strong>` : '₹0.00'}</td>
      </tr>
    `).join('');
  }

  // --- Modal Utilities ---

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  }

  openConfirmModal(heading, message, onConfirm) {
    document.getElementById('confirmHeading').innerText = heading;
    document.getElementById('confirmMessage').innerText = message;
    this.pendingAction = onConfirm;
    this.openModal('confirmModal');
  }

  // --- Floating Toast Notifications ---

  showToast(type = 'info', title = '', message = '') {
    const icons = {
      success: 'fa-circle-check',
      danger: 'fa-triangle-exclamation',
      warning: 'fa-circle-exclamation',
      info: 'fa-circle-info'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-icon"><i class="fa-solid ${icons[type] || 'fa-info'}"></i></div>
      <div class="toast-content">
        <div class="toast-title">${this.escapeHTML(title)}</div>
        <div class="toast-msg">${this.escapeHTML(message)}</div>
      </div>
      <button class="toast-close" aria-label="Close Notification">&times;</button>
    `;

    toast.querySelector('.toast-close').addEventListener('click', () => {
      toast.remove();
    });

    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(40px)';
        setTimeout(() => toast.remove(), 250);
      }
    }, 4500);
  }

  // --- Helper Utilities ---

  escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    this.showToast('info', 'CSV Downloaded', `Exported ${filename}`);
  }
}


/* ============================================================================
   4. APPLICATION ENTRY POINT INITIALIZATION
   ============================================================================ */

let app;

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Library Model
  const library = new Library();
  library.loadFromStorage();

  // 2. Initialize Computer Graphics Lab
  const cgVisualizer = new CGVisualizer();

  // 3. Initialize UI Controller
  app = new UIController(library);
  app.cgVisualizer = cgVisualizer;

  console.log("%c Central Library Management System Loaded ", "background:#1e3a8a; color:#fff; font-weight:bold; padding:4px 8px; border-radius:4px;");
  console.log("Academic Level: Second Year Computer Engineering (SE)");
  console.log("Course: Object-Oriented Programming and Computer Graphics (OOPSCG - 210243/210250)");
});
