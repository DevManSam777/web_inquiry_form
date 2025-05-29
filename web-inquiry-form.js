class WebInquiryForm extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['theme'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'theme') {
      this.updateTheme();
    }
  }

  connectedCallback() {
    this.render();
    this.initializeEvents();
    this.updateTheme();
  }
  updateTheme() {
    // Get the form container - add null check to prevent errors
    const container = this.shadowRoot.querySelector('.form-container');
    if (!container) return; // Skip if element doesn't exist yet
    
    const explicitTheme = this.getAttribute('theme');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // If there's an explicit theme attribute, use it; otherwise, use browser preference
    if (explicitTheme === 'dark' || (explicitTheme !== 'light' && prefersDarkScheme)) {
      container.classList.add('dark-mode');
    } else {
      container.classList.remove('dark-mode');
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .form-container {
          background-color: #fff; 
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5)
        }
        
        h1 {
          color: #2c3e50;
          margin-bottom: 30px;
          text-align: center;
          font-size: 24px;
        }
        
        .form-group {
          margin-bottom: 20px;
          position: relative;
        }
        
        label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          font-size: 16px;
        }
        
        input[type="text"],
        input[type="email"],
        input[type="tel"],
        input[type="url"],
        select,
        textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #aaa;
          border-radius: 4px;
          box-sizing: border-box;
          transition: border-color 0.3s, background-color 0.3s;
          background-color: #fff;
          color: #333;
        }
        
        textarea {
          resize: none;
          min-height: 34px;
          overflow-y: hidden;
          transition: height 0.2s ease;
        }
        
        .radio-group {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
        }
        
        .radio-option {
          display: flex;
          align-items: center;
          vertical-align: middle;
        }
        
        .radio-option input {
          margin-right: 8px;
        }
        
        .radio-option label {
          padding-top: 9px;
        }
        
        .conditional-field {
          margin-top: 15px;
          margin-left: 25px;
          display: none;
        }
        
        .btn-submit {
          background-color: #3498db;
          color: white;
          border: none;
          padding: 12px 20px;
          font-size: 16px;
          border-radius: 4px;
          cursor: pointer;
          width: 100%;
          transition: background-color 0.3s;
        }
        
        .btn-submit:hover {
          background-color: #2980b9;
        }
        
        .required::after {
          content: "*";
          color: #e74c3c;
          margin-left: 4px;
        }
        
        .asterisk {
          color: #e74c3c;
        }
        
        small {
          display: inline-block;
          font-size: 16px;
          font-style: italic;
          font-style: oblique;
          margin-bottom: 10px;
        }
        
        fieldset {
          border: 1px solid #aaa;
          border-radius: 6px;
          padding: 20px;
          margin-bottom: 25px;
          background-color: #fafbfc;
          position: relative;
        }
        
        legend {
          font-weight: bold;
          padding: 0 10px;
          color: #2c3e50;
          font-size: 18px;
        }
        
        fieldset:last-of-type {
          margin-bottom: 30px;
        }
        
        /* Validation styles */
        .error-message {
          color: #d32f2f;
          font-size: 14px;
          margin-top: 4px;
          font-weight: 500;
          animation: fadeIn 0.3s ease-in-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .invalid {
          border: 1px solid #d32f2f !important;
          background-color: rgba(211, 47, 47, 0.05);
        }
        
        /* Focus styling */
        input:focus,
        textarea:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 3px rgba(52, 152, 219, 0.3);
        }
        
        input.invalid:focus,
        textarea.invalid:focus {
          border-color: #d32f2f !important;
          box-shadow: 0 0 3px rgba(211, 47, 47, 0.3);
        }
        
        input:not(.invalid):hover,
        textarea:not(.invalid):hover {
          border-color: #3498db;
        }
        
        /* Only apply green validation to required fields that are valid */
        input[required]:valid:not(.invalid):not(:placeholder-shown),
        textarea[required]:valid:not(.invalid):not(:placeholder-shown) {
          border-color: #4caf50;
          background-color: rgba(76, 175, 80, 0.05);
        }
        
        /* Keep normal styling for non-required fields */
        input:not([required]),
        textarea:not([required]) {
          border-color: #aaa;
          background-color: #fff;
        }
        
        /* Explicitly valid state */
        input.valid,
        textarea.valid {
          border-color: #4caf50;
          background-color: rgba(76, 175, 80, 0.05);
        }
        
        /* Toast notification styling */
        .toast-notification {
          position: fixed;
          top: 20px;
          right: 20px;
          background-color: #d4edda;
          color: #155724;
          padding: 15px 20px;
          border-radius: 4px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          z-index: 1000;
          transform: translateX(110%);
          transition: transform 0.3s ease-in-out;
          max-width: 300px;
        }
        
        .toast-notification.show {
          transform: translateX(0);
        }
        
        .extension-option {
          margin-top: 5px;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
        }
        
        .extension-option input[type="checkbox"] {
          margin-right: 5px;
        }
        
        .extension-option label {
          margin: 0;
          display: inline;
          font-weight: normal;
        }
        
        .extension-field {
          margin-top: 5px;
          margin-left: 15px;
          width: 100%;
        }
        
        .extension-field input {
          width: 100%;
          max-width: 100px;
        }
        
        .check-spam-folder {
          margin: 10px auto 0;
          font-size: 12px;
        }
        
        /* Dark mode styles */
        .form-container.dark-mode {
          background-color: #1e2026;
          color: #e9ecef;
        }
        
        .dark-mode h1 {
          color: #f8f9fa;
        }
        
        .dark-mode label {
          color: #e9ecef;
        }
        
        .dark-mode input[type="text"],
        .dark-mode input[type="email"],
        .dark-mode input[type="tel"],
        .dark-mode input[type="url"],
        .dark-mode select,
        .dark-mode textarea {
          background-color: #343a40;
          color: #e9ecef;
          border-color: #495057;
        }
        
        .dark-mode input[type="text"]:focus,
        .dark-mode input[type="email"]:focus,
        .dark-mode input[type="tel"]:focus,
        .dark-mode input[type="url"]:focus,
        .dark-mode select:focus,
        .dark-mode textarea:focus {
          border-color: #5c7cfa;
          box-shadow: 0 0 3px rgba(92, 124, 250, 0.3);
        }
        
        .dark-mode input:not(.invalid):hover,
        .dark-mode textarea:not(.invalid):hover {
          border-color: #5c7cfa;
        }
        
        .dark-mode fieldset {
          border-color: #495057;
          background-color: #252830;
        }
        
        .dark-mode legend {
          color: #f8f9fa;
        }
        
        .dark-mode .btn-submit {
          background-color: #5c7cfa;
        }
        
        .dark-mode .btn-submit:hover {
          background-color: #4c6fe5;
        }
        
        .dark-mode .toast-notification {
          background-color: #155c24;
          color: #ffffff;
        }
        
        .dark-mode .error-message {
          color: #f06595;
        }
        
        .dark-mode .invalid {
          border-color: #f06595 !important;
          background-color: rgba(240, 101, 149, 0.1);
        }
        
        .dark-mode input.invalid:focus,
        .dark-mode textarea.invalid:focus {
          border-color: #f06595 !important;
          box-shadow: 0 0 3px rgba(240, 101, 149, 0.3);
        }
        
        .dark-mode input[required]:valid:not(.invalid):not(:placeholder-shown),
        .dark-mode textarea[required]:valid:not(.invalid):not(:placeholder-shown) {
          border-color: #4fd1c5;
          background-color: rgba(79, 209, 197, 0.1);
        }
        
        .dark-mode input.valid,
        .dark-mode textarea.valid {
          border-color: #4fd1c5;
          background-color: rgba(79, 209, 197, 0.1);
        }
        
        .dark-mode small {
          color: #adb5bd;
        }
        
        .dark-mode .asterisk {
          color: #f06595;
        }
        
        .dark-mode .required::after {
          color: #f06595;
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          h1 {
            font-size: 24px;
          }
          
          .form-container {
            padding: 20px;
          }
          
          .radio-group {
            flex-direction: column;
            gap: 10px;
          }
          
          fieldset {
            padding: 15px;
          }
          
          .extension-field {
            margin-left: 0;
            margin-top: 5px;
          }
        }

        @media (max-width: 480px) {
          :host {
            padding-inline: 0;
          }
          
          h1 {
            font-size: 18px;
          }
          
          legend {
            font-size: 14px;
          }

          label {
            font-size: 12px;
          }
          
          .form-container {
            padding: 15px;
          }
        }
      </style>
      <div class="form-container">
        <h1>Web Development Inquiry</h1>
        <form id="inquiry-form">
          <fieldset>
            <legend>Personal Information</legend>
            <div class="form-group">
              <label for="firstName" class="required">First Name</label>
              <input type="text" id="firstName" name="firstName" required />
            </div>

            <div class="form-group">
              <label for="lastName" class="required">Last Name</label>
              <input type="text" id="lastName" name="lastName" required />
            </div>

            <div class="form-group">
              <label for="email" class="required">Email Address</label>
              <input type="email" id="email" name="email" required />
            </div>

            <div class="form-group">
              <label for="phone" class="required">Phone Number</label>
              <input type="tel" id="phone" name="phone" required />
              <div class="extension-option">
                <input type="checkbox" id="phoneExtCheck" name="phoneExtCheck" />
                <label for="phoneExtCheck">Add Extension</label>
                <div
                  class="extension-field"
                  id="phoneExtField"
                  style="display: none"
                >
                  <input
                    type="text"
                    id="phoneExt"
                    name="phoneExt"
                    placeholder="Extension"
                  />
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="textNumber">Text Number (if different)</label>
              <input type="tel" id="textNumber" name="textNumber" />
            </div>
          </fieldset>

          <fieldset>
            <legend>Business Information</legend>
            <div class="form-group">
              <label for="businessName">Business Name</label>
              <input type="text" id="businessName" name="businessName" />
            </div>

            <div class="form-group">
              <label for="businessPhone">Business Phone Number</label>
              <input type="tel" id="businessPhone" name="businessPhone" />
              <div class="extension-option">
                <input
                  type="checkbox"
                  id="businessPhoneExtCheck"
                  name="businessPhoneExtCheck"
                />
                <label for="businessPhoneExtCheck">Add Extension</label>
                <div
                  class="extension-field"
                  id="businessPhoneExtField"
                  style="display: none"
                >
                  <input
                    type="text"
                    id="businessPhoneExt"
                    name="businessPhoneExt"
                    placeholder="Extension"
                  />
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="businessEmail">Business Email</label>
              <input type="email" id="businessEmail" name="businessEmail" />
            </div>

            <div class="form-group">
              <label for="businessServices">Business Services</label>
              <textarea
                id="businessServices"
                name="businessServices"
                rows="3"
                placeholder="What type of goods and/or services does your business provide?"
              ></textarea>
            </div>
          </fieldset>
          
          <!-- Billing Address Section -->
          <fieldset>
            <legend>Billing Address</legend>

            <div class="form-group">
              <label for="billingStreet" class="required">Street Address</label>
              <input
                type="text"
                id="billingStreet"
                name="billingStreet"
                required
              />
            </div>

            <div class="form-group">
              <label for="billingAptUnit">Apartment/Unit Number</label>
              <input
                type="text"
                id="billingAptUnit"
                name="billingAptUnit"
                placeholder="Apartment, suite, unit, etc. (optional)"
              />
            </div>

            <div class="form-group">
              <label for="billingCity" class="required">City</label>
              <input type="text" id="billingCity" name="billingCity" required />
            </div>

            <div class="form-group" style="display: flex; gap: 10px">
              <div style="flex: 1">
                <label for="billingState" class="required">State/Province</label>
                <input
                  type="text"
                  id="billingState"
                  name="billingState"
                  required
                />
              </div>
              <div style="flex: 1">
                <label for="billingZipCode" class="required"
                  >ZIP/Postal Code</label
                >
                <input
                  type="text"
                  id="billingZipCode"
                  name="billingZipCode"
                  required
                />
              </div>
            </div>

            <div class="form-group">
              <label for="billingCountry" class="required">Country</label>
              <input
                type="text"
                id="billingCountry"
                name="billingCountry"
                required
              />
            </div>
          </fieldset>
          <fieldset>
            <legend>Service Details</legend>
            <div class="form-group">
              <label class="required">Preferred Contact Method</label>
              <div class="radio-group">
                <div class="radio-option">
                  <input
                    type="radio"
                    id="contactPhone"
                    name="preferredContact"
                    value="phone"
                    required
                  />
                  <label for="contactPhone">Phone</label>
                </div>

                <div class="radio-option">
                  <input
                    type="radio"
                    id="contactEmail"
                    name="preferredContact"
                    value="email"
                  />
                  <label for="contactEmail">Email</label>
                </div>

                <div class="radio-option">
                  <input
                    type="radio"
                    id="contactText"
                    name="preferredContact"
                    value="text"
                  />
                  <label for="contactText">Text</label>
                </div>
                <div class="radio-option">
                  <input
                    type="radio"
                    id="contactBusinessPhone"
                    name="preferredContact"
                    value="businessPhone"
                  />
                  <label for="contactBusinessPhone">Business Phone</label>
                </div>
                <div class="radio-option">
                  <input
                    type="radio"
                    id="contactBusinessEmail"
                    name="preferredContact"
                    value="businessEmail"
                  />
                  <label for="contactBusinessEmail">Business Email</label>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="required">Service Desired</label>
              <div class="radio-group">
                <div class="radio-option">
                  <input
                    type="radio"
                    id="serviceWebsite"
                    name="serviceDesired"
                    value="Web Development"
                    required
                  />
                  <label for="serviceWebsite">Website</label>
                </div>
                <div class="radio-option">
                  <input
                    type="radio"
                    id="serviceApp"
                    name="serviceDesired"
                    value="App Development"
                  />
                  <label for="serviceApp">App Development</label>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>Do you currently have a website?</label>
              <div class="radio-group">
                <div class="radio-option">
                  <input
                    type="radio"
                    id="websiteYes"
                    name="hasWebsite"
                    value="yes"
                  />
                  <label for="websiteYes">Yes</label>
                </div>
                <div class="radio-option">
                  <input
                    type="radio"
                    id="websiteNo"
                    name="hasWebsite"
                    value="no"
                  />
                  <label for="websiteNo">No</label>
                </div>
              </div>

              <div class="conditional-field" id="websiteAddressField">
                <label for="websiteAddress">Website Address</label>
                <input
                  type="text"
                  id="websiteAddress"
                  name="websiteAddress"
                  placeholder="example.com"
                />
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend>Additional Information</legend>
            <div class="form-group">
              <label for="message">Message</label>
              <textarea
                id="message"
                name="message"
                rows="3"
                placeholder="Additional comments"
              ></textarea>
            </div>
          </fieldset>
          <small><span class="asterisk">*</span> = required field</small>
          <button type="submit" class="btn-submit">Submit Inquiry</button>
          <small class="check-spam-folder">A confirmation will be sent to the email address provided. If you do not see the email, please check your spam folder.</small>
        </form>
      </div>
    `;
  }

  initializeEvents() {
    // Get important elements
    const form = this.shadowRoot.getElementById('inquiry-form');
    
    // Initialize auto-resize for textareas
    this.initializeAutoResizeTextareas();
    
    // Initialize form validation
    this.initializeFormValidation();
    
    // Initialize phone number formatting (we need to load Cleave.js)
    this.loadCleavejs().then(() => {
      this.initializePhoneFormatting();
    });
    
    // Initialize conditional fields
    this.initializeConditionalFields();
    
    // Form submission
    form.addEventListener('submit', this.handleFormSubmit.bind(this));
  }
  
  loadCleavejs() {
    return new Promise((resolve, reject) => {
      if (window.Cleave) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/cleave.js@1.6.0/dist/cleave.min.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Cleave.js'));
      document.head.appendChild(script);
    });
  }
  
  initializeAutoResizeTextareas() {
    const textareas = this.shadowRoot.querySelectorAll('textarea');
    
    textareas.forEach(textarea => {
      // Set initial height based on content
      this.adjustTextareaHeight(textarea);
      
      // Add event listener for input changes
      textarea.addEventListener('input', () => {
        this.adjustTextareaHeight(textarea);
      });
    });
  }
  
  adjustTextareaHeight(textarea) {
    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    
    // Set height to scrollHeight to fit content
    textarea.style.height = textarea.scrollHeight + 'px';
  }
  
  initializePhoneFormatting() {
    const phoneInputs = this.shadowRoot.querySelectorAll('input[type="tel"]');
    
    if (window.Cleave) {
      phoneInputs.forEach(input => {
        new window.Cleave(input, {
          numericOnly: true,
          blocks: [3, 3, 4],
          delimiters: ['-', '-']
        });
      });
    }
  }
  
  initializeConditionalFields() {
    // Phone extension checkbox
    const phoneExtCheck = this.shadowRoot.getElementById('phoneExtCheck');
    const phoneExtField = this.shadowRoot.getElementById('phoneExtField');
    
    phoneExtCheck.addEventListener('change', function() {
      phoneExtField.style.display = this.checked ? 'block' : 'none';
      // Clear the field when hiding
      if (!this.checked) {
        phoneExtField.querySelector('input').value = '';
      }
    });
    
    // Business phone extension checkbox
    const businessPhoneExtCheck = this.shadowRoot.getElementById('businessPhoneExtCheck');
    const businessPhoneExtField = this.shadowRoot.getElementById('businessPhoneExtField');
    
    businessPhoneExtCheck.addEventListener('change', function() {
      businessPhoneExtField.style.display = this.checked ? 'block' : 'none';
      // Clear the field when hiding
      if (!this.checked) {
        businessPhoneExtField.querySelector('input').value = '';
      }
    });
    
    // Website address conditional field
    const websiteYes = this.shadowRoot.getElementById('websiteYes');
    const websiteNo = this.shadowRoot.getElementById('websiteNo');
    const websiteAddressField = this.shadowRoot.getElementById('websiteAddressField');
    
    websiteYes.addEventListener('change', function() {
      websiteAddressField.style.display = this.checked ? 'block' : 'none';
    });
    
    websiteNo.addEventListener('change', function() {
      websiteAddressField.style.display = 'none';
      // Clear the field when hiding
      websiteAddressField.querySelector('input').value = '';
    });
  }
  
  initializeFormValidation() {
    const form = this.shadowRoot.getElementById('inquiry-form');
    
    // Add blur event listeners to validate as user moves between fields
    const requiredInputs = form.querySelectorAll('input[required], textarea[required]');
    requiredInputs.forEach(input => {
      input.addEventListener('blur', () => {
        this.validateField(input);
      });
    });
    
    // Add input event listeners to validate as user types
    const emailInputs = form.querySelectorAll('input[type="email"]');
    emailInputs.forEach(input => {
      input.addEventListener('input', () => {
        if (input.value.trim() !== '') {
          if (!this.isValidEmail(input.value)) {
            this.showError(input, 'Please enter a valid email address');
          } else {
            this.removeError(input);
          }
        }
      });
    });
    
    // Add blur event listeners to validate phone numbers
    const phoneInputs = form.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
      input.addEventListener('blur', () => {
        if (input.value.trim() !== '' && input.required) {
          if (!this.isValidPhone(input.value)) {
            this.showError(input, 'Please enter a valid 10-digit phone number in format: 000-000-0000');
          } else {
            this.removeError(input);
          }
        }
      });
    });
    
    // Add input validation for website field
    const websiteAddressInput = this.shadowRoot.getElementById('websiteAddress');
    if (websiteAddressInput) {
      websiteAddressInput.addEventListener('input', () => {
        if (websiteAddressInput.value.trim() !== '') {
          if (!this.isValidUrl(websiteAddressInput.value)) {
            this.showError(websiteAddressInput, 'Please enter a valid website address (e.g., example.com)');
          } else {
            this.removeError(websiteAddressInput);
          }
        }
      });
    }
  }
  
  validateField(field) {
    if (field.required && field.value.trim() === '') {
      this.showError(field, 'This field is required');
      return false;
    }
    
    if (field.type === 'email' && field.value.trim() !== '') {
      if (!this.isValidEmail(field.value)) {
        this.showError(field, 'Please enter a valid email address');
        return false;
      }
    }
    
    if (field.type === 'tel' && field.value.trim() !== '' && field.required) {
      if (!this.isValidPhone(field.value)) {
        this.showError(field, 'Please enter a valid 10-digit phone number in format: 000-000-0000');
        return false;
      }
    }
    
    if (field.id === 'websiteAddress' && field.value.trim() !== '') {
      if (!this.isValidUrl(field.value)) {
        this.showError(field, 'Please enter a valid website address (e.g., example.com)');
        return false;
      }
    }
    
    // Specific validation for billing address fields
    if (field.id === 'billingZipCode' && field.value.trim() !== '') {
      if (!/^\d{5}(-\d{4})?$/.test(field.value)) {
        this.showError(field, 'Please enter a valid ZIP code (e.g., 12345 or 12345-6789)');
        return false;
      }
    }
    
    // Validation for city, state, and street address
    if ((field.id === 'billingCity' || field.id === 'billingState' || field.id === 'billingStreet') && field.value.trim() !== '') {
      if (field.value.length < 2) {
        this.showError(field, 'Please enter a valid ' + field.name.replace('billing', '').toLowerCase());
        return false;
      }
    }
    
    this.removeError(field);
    return true;
  }
  
  validateRadioGroup(name) {
    const radioButtons = this.shadowRoot.querySelectorAll(`input[name="${name}"]`);
    const radioGroup = radioButtons[0].parentElement.parentElement.parentElement;
    const isChecked = [...radioButtons].some(radio => radio.checked);
    
    if (!isChecked) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-message';
      errorDiv.textContent = 'Please select an option';
      
      // Remove existing error message if any
      const existingError = radioGroup.querySelector('.error-message');
      if (existingError) {
        existingError.remove();
      }
      
      radioGroup.appendChild(errorDiv);
      return false;
    } else {
      const existingError = radioGroup.querySelector('.error-message');
      if (existingError) {
        existingError.remove();
      }
      return true;
    }
  }
  
  validateWebsiteAddress() {
    const hasWebsiteYes = this.shadowRoot.getElementById('websiteYes');
    const websiteAddress = this.shadowRoot.getElementById('websiteAddress');
    
    if (hasWebsiteYes.checked && websiteAddress.value.trim() === '') {
      this.showError(websiteAddress, 'Please provide your website address');
      return false;
    }
    
    if (hasWebsiteYes.checked && websiteAddress.value.trim() !== '') {
      if (!this.isValidUrl(websiteAddress.value)) {
        this.showError(websiteAddress, 'Please enter a valid website address (e.g., example.com)');
        return false;
      }
    }
    
    this.removeError(websiteAddress);
    return true;
  }
  
  showError(input, message) {
    // Remove any existing error message
    const existingError = input.parentElement.querySelector('.error-message');
    if (existingError) {
      existingError.remove();
    }
    
    // Create and add new error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    input.parentElement.appendChild(errorDiv);
    
    // Add error class to the input
    input.classList.add('invalid');
  }
  
  removeError(input) {
    const errorDiv = input.parentElement.querySelector('.error-message');
    if (errorDiv) {
      errorDiv.remove();
    }
    input.classList.remove('invalid');
  }
  
  isValidPhone(phone) {
    // Must be in format 000-000-0000 (10 digits with hyphens)
    const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
    return phoneRegex.test(phone);
  }
  
  isValidEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }
  
  isValidUrl(url) {
    if (!url) return true; // Allow empty URLs
    
    // For URLs with a protocol, validate directly
    if (/^https?:\/\//i.test(url)) {
      try {
        new URL(url);
        return true;
      } catch (e) {
        return false;
      }
    }
    
    // For URLs without a protocol, check if it has a domain suffix
    const domainSuffixRegex = /\.[a-z]{2,}(\S*)/i;
    if (!domainSuffixRegex.test(url)) {
      return false; // URL must have a domain suffix
    }
    
    // Add protocol for validation
    try {
      new URL('http://' + url);
      return true;
    } catch (e) {
      return false;
    }
  }
  
  showToast(message) {
    // Create toast element if it doesn't exist
    let toast = this.shadowRoot.getElementById('toast-notification');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast-notification';
      toast.className = 'toast-notification';
      this.shadowRoot.appendChild(toast);
    }
    
    // Set message
    toast.textContent = message;
    
    // Show toast
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);
    
    // Hide toast after 5 seconds
    setTimeout(() => {
      toast.classList.remove('show');
    }, 5000);
  }
  
  async handleFormSubmit(event) {
    event.preventDefault();
    
    const form = this.shadowRoot.getElementById('inquiry-form');
    let isValid = true;
    
    // Get all required fields
    const requiredInputs = form.querySelectorAll('input[required], textarea[required]');
    
    // Validate all required fields
    requiredInputs.forEach(input => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });
    
    // Validate radio button groups
    if (!this.validateRadioGroup('preferredContact')) {
      isValid = false;
    }
    
    if (!this.validateRadioGroup('serviceDesired')) {
      isValid = false;
    }
    
    // Validate conditional website address
    if (this.shadowRoot.getElementById('websiteYes').checked) {
      if (!this.validateWebsiteAddress()) {
        isValid = false;
      }
    }
    
    if (!isValid) {
      // Scroll to the first error
      const firstError = this.shadowRoot.querySelector('.error-message');
      if (firstError) {
        firstError.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
      return;
    }
    
    // If validation passes, prepare form data
    const formData = new FormData(form);
    const formObject = {};
    
    formData.forEach((value, key) => {
      // Store all values as-is, without modification
      formObject[key] = value;
    });
    
    // Include billing address fields
    formObject.billingAddress = {
      street: this.shadowRoot.getElementById('billingStreet').value || '',
      aptUnit: this.shadowRoot.getElementById('billingAptUnit').value || '',
      city: this.shadowRoot.getElementById('billingCity').value || '',
      state: this.shadowRoot.getElementById('billingState').value || '',
      zipCode: this.shadowRoot.getElementById('billingZipCode').value || '',
      country: this.shadowRoot.getElementById('billingCountry').value || 'USA'
    };
    
    // Handle phone extensions properly
    if (formObject.phoneExtCheck === 'on' && formObject.phoneExt) {
      formObject.phoneExt = formObject.phoneExt;
    } else {
      formObject.phoneExt = undefined;
    }
    
    if (formObject.businessPhoneExtCheck === 'on' && formObject.businessPhoneExt) {
      formObject.businessPhoneExt = formObject.businessPhoneExt;
    } else {
      formObject.businessPhoneExt = undefined;
    }
    
    // Clean up the data by removing the checkbox values
    delete formObject.phoneExtCheck;
    delete formObject.businessPhoneExtCheck;
    
    // Add the isFormSubmission flag to identify this as coming from the form
    formObject.isFormSubmission = true;
    
    // Dispatch a custom event with the form data
    const submitEvent = new CustomEvent('form-submit', {
      bubbles: true,
      composed: true,
      detail: formObject
    });
    
    this.dispatchEvent(submitEvent);
    
    try {
      // Default API endpoint, can be customized via attribute
      const apiUrl = this.getAttribute('api-url') || 'http://localhost:5000/api/leads';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formObject),
      });
      
      if (response.ok) {
        // Show success message as toast notification
        this.showToast('Thank you for your inquiry! We\'ll be in touch soon.');
        
        // Reset the form
        form.reset();
        
        // Reset extension fields and hide them
        this.shadowRoot.getElementById('phoneExtField').style.display = 'none';
        this.shadowRoot.getElementById('businessPhoneExtField').style.display = 'none';
        
        // Hide any conditional fields
        this.shadowRoot.getElementById('websiteAddressField').style.display = 'none';
        
        // Dispatch success event
        this.dispatchEvent(new CustomEvent('form-success', {
          bubbles: true,
          composed: true,
          detail: { message: 'Form submitted successfully' }
        }));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Server responded with an error');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      this.showToast('Error: ' + error.message);
      
      // Dispatch error event
      this.dispatchEvent(new CustomEvent('form-error', {
        bubbles: true,
        composed: true,
        detail: { error: error.message }
      }));
    }
  }
}

// Define the custom element
customElements.define('web-inquiry-form', WebInquiryForm);