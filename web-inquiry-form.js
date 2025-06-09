class WebInquiryForm extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.currentStep = 0;
    this.totalSteps = 5;
    this.completedSteps = new Set();
  }

  static get observedAttributes() {
    return ["theme"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "theme") {
      this.updateTheme();
    }
  }

  connectedCallback() {
    this.render();
    this.initializeEvents();
    this.updateTheme();
    this.updateProgress();
  }

  updateTheme() {
    const container = this.shadowRoot.querySelector(".form-container");
    if (!container) return;

    const explicitTheme = this.getAttribute("theme");
    const prefersDarkScheme = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    if (
      explicitTheme === "dark" ||
      (explicitTheme !== "light" && prefersDarkScheme)
    ) {
      container.classList.add("dark-mode");
    } else {
      container.classList.remove("dark-mode");
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
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .form-header {
          color: #2c3e50;
          margin-bottom: 30px;
          text-align: center;
        }

        .form-header h1 {
          font-size: 24px;
          line-height: 1;
          margin-bottom: -8px;
        }

        .form-header p {
          font-size: 14px;
          opacity: 0.8;
        }

        .progress-section {
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid #e9ecef;
        }

        .progress-bar {
          width: 100%;
          height: 6px;
          background: rgba(52, 152, 219, 0.1);
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 15px;
        }

        .progress-fill {
          height: 100%;
          background: #3498db;
          border-radius: 3px;
          transition: width 0.3s ease;
          width: 0%;
        }

        .step-indicators {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          padding: 0 5px;
        }

        .step-indicator {
          display: flex;
          align-items: center;
          color: #6c757d;
        }

        .step-indicator.active {
          color: #3498db;
          font-weight: 600;
        }

        .step-indicator.completed {
          color: #4caf50;
        }

        .step-dot {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #e9ecef;
          color: #6c757d;
          margin-right: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: bold;
        }

        .step-indicator.active .step-dot {
          background: #3498db;
          color: white;
        }

        .step-indicator.completed .step-dot {
          background: #4caf50;
          color: white;
        }

        .section {
          display: none;
        }

        .section.active {
          display: block;
        }

        .section-content {
          border: none;
          border-radius: 0;
          padding: 0;
          margin-bottom: 0;
          background-color: transparent;
          position: relative;
        }

        fieldset {
          border: 1px solid #aaa;
          border-radius: 6px;
          padding: 20px;
          margin-bottom: 25px;
          background-color: #fafbfc;
        }

        legend {
          font-size: 18px;
          font-weight: bold;
          color: #2c3e50;
          padding: 0 10px;
        }

        .section-subtitle {
          color: #666;
          font-size: 16px;
          text-align: center;
          margin-top: -10px;
        }

        .form-group {
          margin: 0 0 20px 0;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          font-size: 16px;
          color: #333;
        }

        .form-group input[type="text"],
        .form-group input[type="email"],
        .form-group input[type="tel"],
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 10px;
          border: 1px solid #aaa;
          border-radius: 4px;
          box-sizing: border-box;
          transition: border-color 0.3s, background-color 0.3s;
          background-color: #fff;
          color: #333;
          font-size: 16px;
        }

        .form-group textarea {
          resize: vertical;
          min-height: 80px;
        }

        .form-group input[type="text"]:focus,
        .form-group input[type="email"]:focus,
        .form-group input[type="tel"]:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 3px rgba(52, 152, 219, 0.3);
        }

        .required::after {
          content: "*";
          color: #e74c3c;
          margin-left: 4px;
        }

        .radio-group {
          margin-top: 10px;
        }

        .radio-option {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
          width: 100%;
        }

        .radio-option input[type="radio"] {
          width: auto;
          margin-right: 8px;
          margin-bottom: 0;
          flex-shrink: 0;
        }

        .radio-option label {
          margin: 0;
          font-weight: normal;
          cursor: pointer;
          width: auto;
          flex: none;
        }

        .extension-option {
          margin-top: 15px;
          padding: 15px;
          background: #fafbfc;
          border-radius: 6px;
          border: 1px solid #e9ecef;
        }

        .checkbox-wrapper {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
        }

        .checkbox-wrapper input[type="checkbox"] {
          width: auto;
          margin-right: 8px;
        }

        .checkbox-wrapper label {
          margin: 0;
          font-weight: normal;
        }

        .conditional-field {
          display: none;
          margin-top: 10px;
        }

        .conditional-field.show {
          display: block;
        }

        .address-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .navigation {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid rgb(186, 186, 186);
        }

        .btn {
          padding: 12px 20px;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
          transition: background-color 0.3s;
          min-width: 120px;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-secondary {
          background-color: #6c757d;
          color: white;
        }

        .btn-secondary:hover:not(:disabled) {
          background-color: #5a6268;
        }

        .btn-primary {
          background-color: #3498db;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background-color: #2980b9;
        }

        .error-message {
          color: #d32f2f;
          font-size: 14px;
          margin-top: 4px;
          font-weight: 500;
        }

        .invalid {
          border: 1px solid #d32f2f !important;
          background-color: rgba(211, 47, 47, 0.05);
        }

        .valid {
          border-color: #4caf50;
          background-color: rgba(76, 175, 80, 0.05);
        }

        .toast {
          position: fixed;
          bottom: 350px;
          right: 20px;
          background: #4caf50;
          color: white;
          padding: 15px 20px;
          border-radius: 6px;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
          z-index: 1000;
          transform: translateX(100%);
          transition: transform 0.3s ease, opacity 0.3s ease;
          opacity: 1;
          font-family: inherit;
          font-size: 14px;
          font-weight: 500;
          min-width: 200px;
          max-width: 400px;
          word-wrap: break-word;
          display: block;
        }

        .toast.show {
          transform: translateX(0);
        }

        .toast.hide {
          opacity: 0;
          transform: translateX(100%);
        }

        .toast.error {
          background: #f44336;
        }

        /* Review Section */
        .review-container {
          display: grid;
          gap: 20px;
        }

        .review-section {
          background: #fafbfc;
          border-radius: 6px;
          padding: 20px;
          border: 1px solid #e9ecef;
        }

        .review-section h3 {
          color: #2c3e50;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 15px;
          border-bottom: 1px solid #e9ecef;
          padding-bottom: 8px;
        }

        .review-item {
          display: grid;
          grid-template-columns: 160px 1fr;
          gap: 12px;
          margin-bottom: 8px;
          align-items: start;
        }

        .review-label {
          font-weight: 500;
          color: #495057;
          font-size: 16px;
        }

        .review-value {
          color: #2c3e50;
          word-break: break-word;
          font-size: 16px;
        }

        .review-value.empty {
          color: #6c757d;
          font-style: italic;
        }

        .edit-step-btn {
          background: none;
          border: 1px solid #3498db;
          color: #3498db;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 10px;
        }

        .edit-step-btn:hover {
          background: #3498db;
          color: white;
        }

        /* Dark Mode */
        .form-container.dark-mode {
          background-color: #1e2026;
          color: #e9ecef;
        }

        .dark-mode fieldset {
          background-color: #252830;
          border-color: #495057;
        }

        .dark-mode legend {
          color: #f8f9fa;
        }

        .dark-mode .progress-section {
          background-color: #252830;
          border-bottom-color: #495057;
        }

        .dark-mode .form-header {
          color: #f8f9fa;
        }

        .dark-mode .form-group label {
          color: #e9ecef;
        }

        .dark-mode .form-group input[type="text"],
        .dark-mode .form-group input[type="email"],
        .dark-mode .form-group input[type="tel"],
        .dark-mode .form-group textarea,
        .dark-mode .form-group select {
          background-color: #343a40;
          color: #e9ecef;
          border-color: #495057;
        }

        .dark-mode .form-group input[type="text"]:focus,
        .dark-mode .form-group input[type="email"]:focus,
        .dark-mode .form-group input[type="tel"]:focus,
        .dark-mode .form-group textarea:focus,
        .dark-mode .form-group select:focus {
          border-color: #3498db;
          box-shadow: 0 0 3px rgba(52, 152, 219, 0.3);
        }

        .dark-mode .extension-option {
          background-color: #252830;
          border-color: #495057;
        }

        .dark-mode .review-section {
          background-color: #252830;
          border-color: #495057;
        }

        .dark-mode .review-section h3 {
          color: #f8f9fa;
          border-bottom-color: #495057;
        }

        .dark-mode .review-label {
          color: #adb5bd;
        }

        .dark-mode .review-value {
          color: #e9ecef;
        }

        .dark-mode .review-value.empty {
          color: #6c757d;
        }

        /* Responsive */
        @media (max-width: 768px) {
          :host {
            padding: 10px;
          }

          .form-container {
            padding: 20px;
          }

          .form-header h1 {
            font-size: 20px;
          }

          fieldset {
            padding: 15px;
          }

          legend {
            font-size: 16px;
          }

          .form-group label {
            font-size: 14px;
          }

          .address-row {
            grid-template-columns: 1fr;
          }

          .step-indicators {
            font-size: 12px;
          }

          .step-indicator span {
            display: none;
          }

          .review-item {
            grid-template-columns: 1fr;
            gap: 4px;
          }

          .review-label {
            font-weight: 600;
          }

          .review-label {
            font-weight: 600;
          }

          .review-section h3 {
            font-size: 16px;
          }

          .review-label {
            font-size: 14px;
          }

          .review-value {
            font-size: 14px;
          }
        }

        @media (max-width: 480px) {
          :host {
            padding: 5px;
          }

          .form-container {
            padding: 15px;
          }

          .form-header h1 {
            font-size: 18px;
          }

          .form-header p {
            font-size: 12px;
          }

          fieldset {
            padding: 10px;
          }

          legend {
            font-size: 14px;
          }

          .section-subtitle {
            font-size: 12px;
          }

          .form-group label {
            font-size: 12px;
          }

          .step-indicators {
            font-size: 10px;
          }

          .btn {
            font-size: 14px;
            padding: 10px 16px;
            min-width: 100px;
          }

          .review-section h3 {
            font-size: 14px;
          }

          .review-label {
            font-size: 12px;
          }

          .review-value {
            font-size: 12px;
          }

          .edit-step-btn {
            font-size: 12px;
            padding: 4px 8px;
          }
        }
      </style>

      <div class="form-container">
        <div class="form-header">
          <h1>Web Development Inquiry</h1>
        </div>

        <div class="progress-section">
          <div class="progress-bar">
            <div class="progress-fill"></div>
          </div>
          <div class="step-indicators">
            <div class="step-indicator active" data-step="0">
              <div class="step-dot">1</div>
              <span>Personal</span>
            </div>
            <div class="step-indicator" data-step="1">
              <div class="step-dot">2</div>
              <span>Business</span>
            </div>
            <div class="step-indicator" data-step="2">
              <div class="step-dot">3</div>
              <span>Billing</span>
            </div>
            <div class="step-indicator" data-step="3">
              <div class="step-dot">4</div>
              <span>Service</span>
            </div>
            <div class="step-indicator" data-step="4">
              <div class="step-dot">5</div>
              <span>Review</span>
            </div>
          </div>
        </div>

        <form id="inquiry-form">
          <!-- Step 1: Personal Information -->
          <div class="section active" data-step="0">
            <fieldset>
              <legend>Personal Information</legend>
              <p class="section-subtitle">Tell us about yourself!</p>

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
                  <div class="checkbox-wrapper">
                    <input type="checkbox" id="phoneExtCheck" name="phoneExtCheck" />
                    <label for="phoneExtCheck">Add Extension</label>
                  </div>
                  <div class="conditional-field" id="phoneExtField">
                    <div class="form-group">
                      <label for="phoneExt">Extension</label>
                      <input type="text" id="phoneExt" name="phoneExt" />
                    </div>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label for="textNumber">Text Number (if different)</label>
                <input type="tel" id="textNumber" name="textNumber" />
              </div>
            </fieldset>
          </div>

          <!-- Step 2: Business Information -->
          <div class="section" data-step="1">
            <fieldset>
              <legend>Business Information</legend>
              <p class="section-subtitle">Tell us about your business!</p>

              <div class="form-group">
                <label for="businessName">Business Name</label>
                <input type="text" id="businessName" name="businessName" />
              </div>

              <div class="form-group">
                <label for="businessPhone">Business Phone Number</label>
                <input type="tel" id="businessPhone" name="businessPhone" />
                
                <div class="extension-option">
                  <div class="checkbox-wrapper">
                    <input type="checkbox" id="businessPhoneExtCheck" name="businessPhoneExtCheck" />
                    <label for="businessPhoneExtCheck">Add Extension</label>
                  </div>
                  <div class="conditional-field" id="businessPhoneExtField">
                    <div class="form-group">
                      <label for="businessPhoneExt">Extension</label>
                      <input type="text" id="businessPhoneExt" name="businessPhoneExt" />
                    </div>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label for="businessEmail">Business Email</label>
                <input type="email" id="businessEmail" name="businessEmail" />
              </div>

              <div class="form-group">
                <label for="businessServices">Business Services</label>
                <textarea id="businessServices" name="businessServices" placeholder="What type of goods and/or services does your business provide?"></textarea>
              </div>
            </fieldset>
          </div>

          <!-- Step 3: Billing Address -->
          <div class="section" data-step="2">
            <fieldset>
              <legend>Billing Address</legend>
              <p class="section-subtitle">What is your mailing address?</p>

              <div class="form-group">
                <label for="billingStreet" class="required">Street Address</label>
                <input type="text" id="billingStreet" name="billingStreet" required />
              </div>

              <div class="form-group">
                <label for="billingAptUnit">Apartment/Unit Number</label>
                <input type="text" id="billingAptUnit" name="billingAptUnit" />
              </div>

              <div class="form-group">
                <label for="billingCity" class="required">City</label>
                <input type="text" id="billingCity" name="billingCity" required />
              </div>

              <div class="address-row">
                <div class="form-group">
                  <label for="billingState" class="required">State/Province</label>
                  <input type="text" id="billingState" name="billingState" required />
                </div>
                <div class="form-group">
                  <label for="billingZipCode" class="required">ZIP/Postal Code</label>
                  <input type="text" id="billingZipCode" name="billingZipCode" required />
                </div>
              </div>

              <div class="form-group">
                <label for="billingCountry" class="required">Country</label>
                <input type="text" id="billingCountry" name="billingCountry" value="USA" required />
              </div>
            </fieldset>
          </div>

          <!-- Step 4: Service Details -->
          <div class="section" data-step="3">
            <fieldset>
              <legend>Service Details</legend>
              <p class="section-subtitle">What can we help you with?</p>

              <div class="form-group">
                <label class="required">Preferred Contact Method</label>
                <div class="radio-group">
                  <div class="radio-option">
                    <input type="radio" id="contactPhone" name="preferredContact" value="phone" required />
                    <label for="contactPhone">Phone</label>
                  </div>
                  <div class="radio-option">
                    <input type="radio" id="contactEmail" name="preferredContact" value="email" />
                    <label for="contactEmail">Email</label>
                  </div>
                  <div class="radio-option">
                    <input type="radio" id="contactText" name="preferredContact" value="text" />
                    <label for="contactText">Text</label>
                  </div>
                  <div class="radio-option">
                    <input type="radio" id="contactBusinessPhone" name="preferredContact" value="businessPhone" />
                    <label for="contactBusinessPhone">Business Phone</label>
                  </div>
                  <div class="radio-option">
                    <input type="radio" id="contactBusinessEmail" name="preferredContact" value="businessEmail" />
                    <label for="contactBusinessEmail">Business Email</label>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label class="required">Service Desired</label>
                <div class="radio-group">
                  <div class="radio-option">
                    <input type="radio" id="serviceWebsite" name="serviceDesired" value="Web Development" required />
                    <label for="serviceWebsite">Website</label>
                  </div>
                  <div class="radio-option">
                    <input type="radio" id="serviceApp" name="serviceDesired" value="App Development" />
                    <label for="serviceApp">App Development</label>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label>Do you currently have a website?</label>
                <div class="radio-group">
                  <div class="radio-option">
                    <input type="radio" id="websiteYes" name="hasWebsite" value="yes" />
                    <label for="websiteYes">Yes</label>
                  </div>
                  <div class="radio-option">
                    <input type="radio" id="websiteNo" name="hasWebsite" value="no" />
                    <label for="websiteNo">No</label>
                  </div>
                </div>

                <div class="conditional-field" id="websiteAddressField">
                  <div class="form-group">
                    <label for="websiteAddress">Website Address</label>
                    <input type="text" id="websiteAddress" name="websiteAddress" placeholder="example.com" />
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label for="message">Message</label>
                <textarea id="message" name="message" placeholder="Additional comments"></textarea>
              </div>
            </fieldset>
          </div>

          <!-- Step 5: Review -->
          <div class="section" data-step="4">
            <fieldset>
              <legend>Review Your Information</legend>
              <p class="section-subtitle">Please review your details before submitting</p>

              <div class="review-container" id="reviewContainer">
                <!-- Review content will be populated here -->
              </div>
            </fieldset>
          </div>

          <div class="navigation">
            <button type="button" class="btn btn-secondary" id="prevBtn" style="visibility: hidden;">Previous</button>
            <button type="button" class="btn btn-primary" id="nextBtn">Next</button>
            <button type="submit" class="btn btn-primary" id="submitBtn" style="display: none;">Submit Inquiry</button>
          </div>
        </form>
      </div>
    `;
  }

  initializeEvents() {
    const form = this.shadowRoot.getElementById("inquiry-form");
    const nextBtn = this.shadowRoot.getElementById("nextBtn");
    const prevBtn = this.shadowRoot.getElementById("prevBtn");
    const submitBtn = this.shadowRoot.getElementById("submitBtn");

    // Initialize phone formatting
    this.loadCleavejs().then(() => {
      this.initializePhoneFormatting();
    });

    // Initialize conditional fields
    this.initializeConditionalFields();

    // Initialize validation
    this.initializeValidation();

    // Navigation events
    nextBtn.addEventListener("click", () => this.nextStep());
    prevBtn.addEventListener("click", () => this.prevStep());

    // Form submission
    form.addEventListener("submit", this.handleFormSubmit.bind(this));
    submitBtn.addEventListener("click", (e) => {
      e.preventDefault();
      form.dispatchEvent(new Event("submit"));
    });

    // Validate current step on input
    form.addEventListener("input", () => this.validateCurrentStep());
    form.addEventListener("change", () => this.validateCurrentStep());
  }

  loadCleavejs() {
    return new Promise((resolve, reject) => {
      if (window.Cleave) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src =
        "https://cdn.jsdelivr.net/npm/cleave.js@1.6.0/dist/cleave.min.js";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Cleave.js"));
      document.head.appendChild(script);
    });
  }

  initializePhoneFormatting() {
    const phoneInputs = this.shadowRoot.querySelectorAll('input[type="tel"]');

    if (window.Cleave) {
      phoneInputs.forEach((input) => {
        new window.Cleave(input, {
          numericOnly: true,
          blocks: [3, 3, 4],
          delimiters: ["-", "-"],
        });
      });
    }
  }

  initializeConditionalFields() {
    // Phone extension
    const phoneExtCheck = this.shadowRoot.getElementById("phoneExtCheck");
    const phoneExtField = this.shadowRoot.getElementById("phoneExtField");

    phoneExtCheck.addEventListener("change", function () {
      if (this.checked) {
        phoneExtField.classList.add("show");
      } else {
        phoneExtField.classList.remove("show");
        phoneExtField.querySelector("input").value = "";
      }
    });

    // Business phone extension
    const businessPhoneExtCheck = this.shadowRoot.getElementById(
      "businessPhoneExtCheck"
    );
    const businessPhoneExtField = this.shadowRoot.getElementById(
      "businessPhoneExtField"
    );

    businessPhoneExtCheck.addEventListener("change", function () {
      if (this.checked) {
        businessPhoneExtField.classList.add("show");
      } else {
        businessPhoneExtField.classList.remove("show");
        businessPhoneExtField.querySelector("input").value = "";
      }
    });

    // Website address
    const websiteYes = this.shadowRoot.getElementById("websiteYes");
    const websiteNo = this.shadowRoot.getElementById("websiteNo");
    const websiteAddressField = this.shadowRoot.getElementById(
      "websiteAddressField"
    );

    websiteYes.addEventListener("change", function () {
      if (this.checked) {
        websiteAddressField.classList.add("show");
      }
    });

    websiteNo.addEventListener("change", function () {
      if (this.checked) {
        websiteAddressField.classList.remove("show");
        websiteAddressField.querySelector("input").value = "";
      }
    });
  }

  initializeValidation() {
    const form = this.shadowRoot.getElementById("inquiry-form");

    // Real-time validation
    const inputs = form.querySelectorAll("input, textarea");
    inputs.forEach((input) => {
      input.addEventListener("blur", () => this.validateField(input));
      input.addEventListener("input", () => {
        if (input.classList.contains("invalid")) {
          this.validateField(input);
        }
      });
    });
  }

  validateCurrentStep() {
    const currentSection = this.shadowRoot.querySelector(
      `.section[data-step="${this.currentStep}"]`
    );
    const nextBtn = this.shadowRoot.getElementById("nextBtn");

    if (!currentSection) return true;

    let isValid = true;

    // Check required fields
    const requiredFields = currentSection.querySelectorAll(
      'input[required]:not([type="radio"]), textarea[required]'
    );
    requiredFields.forEach((field) => {
      if (!field.value.trim()) {
        isValid = false;
      }
    });

    // Check required radio groups - find groups that have at least one required radio
    const allRadios = currentSection.querySelectorAll('input[type="radio"]');
    const radioGroups = {};

    // Collect all radio groups and check if any in the group is required
    allRadios.forEach((radio) => {
      if (!radioGroups[radio.name]) {
        radioGroups[radio.name] = {
          hasRequired: false,
          isChecked: false,
        };
      }
      if (radio.required) {
        radioGroups[radio.name].hasRequired = true;
      }
      if (radio.checked) {
        radioGroups[radio.name].isChecked = true;
      }
    });

    // Validate required radio groups
    Object.values(radioGroups).forEach((group) => {
      if (group.hasRequired && !group.isChecked) {
        isValid = false;
      }
    });

    nextBtn.disabled = !isValid;
    return isValid;
  }

  nextStep() {
    if (!this.validateCurrentStep()) {
      return;
    }

    if (this.currentStep < this.totalSteps - 1) {
      this.completedSteps.add(this.currentStep);

      // Hide current section
      const currentSection = this.shadowRoot.querySelector(
        `.section[data-step="${this.currentStep}"]`
      );
      currentSection.classList.remove("active");

      // Move to next step
      this.currentStep++;

      // Show next section
      const nextSection = this.shadowRoot.querySelector(
        `.section[data-step="${this.currentStep}"]`
      );
      nextSection.classList.add("active");

      // If we're on the review step, populate the review
      if (this.currentStep === 4) {
        this.populateReview();
      }

      this.updateProgress();
      this.updateNavigation();
    }
  }

  prevStep() {
    if (this.currentStep > 0) {
      // Hide current section
      const currentSection = this.shadowRoot.querySelector(
        `.section[data-step="${this.currentStep}"]`
      );
      currentSection.classList.remove("active");

      // Move to previous step
      this.currentStep--;

      // Show previous section
      const prevSection = this.shadowRoot.querySelector(
        `.section[data-step="${this.currentStep}"]`
      );
      prevSection.classList.add("active");

      this.updateProgress();
      this.updateNavigation();
    }
  }

  updateProgress() {
    const progressFill = this.shadowRoot.querySelector(".progress-fill");
    const stepIndicators = this.shadowRoot.querySelectorAll(".step-indicator");

    // Update progress bar
    const progress = (this.currentStep / (this.totalSteps - 1)) * 100;
    progressFill.style.width = `${progress}%`;

    // Update step indicators
    stepIndicators.forEach((indicator, index) => {
      indicator.classList.remove("active", "completed");

      if (index === this.currentStep) {
        indicator.classList.add("active");
      } else if (this.completedSteps.has(index)) {
        indicator.classList.add("completed");
        indicator.querySelector(".step-dot").textContent = "✓";
      } else {
        indicator.querySelector(".step-dot").textContent = index + 1;
      }
    });
  }

  updateNavigation() {
    const prevBtn = this.shadowRoot.getElementById("prevBtn");
    const nextBtn = this.shadowRoot.getElementById("nextBtn");
    const submitBtn = this.shadowRoot.getElementById("submitBtn");

    // Previous button
    prevBtn.style.visibility = this.currentStep > 0 ? "visible" : "hidden";

    // Next/Submit buttons
    if (this.currentStep === this.totalSteps - 1) {
      nextBtn.style.display = "none";
      submitBtn.style.display = "inline-block";
    } else {
      nextBtn.style.display = "inline-block";
      submitBtn.style.display = "none";
    }

    this.validateCurrentStep();
  }

  validateField(field) {
    this.removeError(field);

    if (field.required && !field.value.trim()) {
      this.showError(field, "This field is required");
      return false;
    }

    if (field.type === "email" && field.value.trim()) {
      if (!this.isValidEmail(field.value)) {
        this.showError(field, "Please enter a valid email address");
        return false;
      }
    }

    if (field.type === "tel" && field.value.trim() && field.required) {
      if (!this.isValidPhone(field.value)) {
        this.showError(field, "Please enter a valid phone number");
        return false;
      }
    }

    field.classList.add("valid");
    return true;
  }

  showError(input, message) {
    this.removeError(input);

    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = message;
    input.parentElement.appendChild(errorDiv);

    input.classList.add("invalid");
    input.classList.remove("valid");
  }

  removeError(input) {
    const errorDiv = input.parentElement.querySelector(".error-message");
    if (errorDiv) {
      errorDiv.remove();
    }
    input.classList.remove("invalid");
  }

  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  isValidPhone(phone) {
    return /^\d{3}-\d{3}-\d{4}$/.test(phone);
  }

  showToast(message, isError = false) {
    // Remove any existing toast
    const existingToast = this.shadowRoot.querySelector('.toast');
    if (existingToast) {
      existingToast.remove();
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    
    if (isError) {
      toast.classList.add('error');
    }

    // Add to shadow DOM
    this.shadowRoot.appendChild(toast);

    // Trigger animation after a brief delay to ensure element is in DOM
    setTimeout(() => {
      toast.classList.add('show');
    }, 50);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      toast.classList.add('hide');
      
      // Remove element after animation completes
      setTimeout(() => {
        if (toast.parentNode) {
          toast.remove();
        }
      }, 300);
    }, 5000);
  }

  populateReview() {
    const reviewContainer = this.shadowRoot.getElementById("reviewContainer");
    const form = this.shadowRoot.getElementById("inquiry-form");

    const sections = [
      {
        title: "Personal Information",
        step: 0,
        fields: [
          { id: "firstName", label: "First Name", required: true },
          { id: "lastName", label: "Last Name", required: true },
          { id: "email", label: "Email", required: true },
          { id: "phone", label: "Phone", required: true },
          { id: "phoneExt", label: "Phone Extension" },
          { id: "textNumber", label: "Text Number" },
        ],
      },
      {
        title: "Business Information",
        step: 1,
        fields: [
          { id: "businessName", label: "Business Name" },
          { id: "businessPhone", label: "Business Phone" },
          { id: "businessPhoneExt", label: "Business Extension" },
          { id: "businessEmail", label: "Business Email" },
          { id: "businessServices", label: "Business Services" },
        ],
      },
      {
        title: "Billing Address",
        step: 2,
        fields: [
          { id: "billingStreet", label: "Street Address", required: true },
          { id: "billingAptUnit", label: "Apt/Unit" },
          { id: "billingCity", label: "City", required: true },
          { id: "billingState", label: "State/Province", required: true },
          { id: "billingZipCode", label: "ZIP Code", required: true },
          { id: "billingCountry", label: "Country", required: true },
        ],
      },
      {
        title: "Service Details",
        step: 3,
        fields: [
          {
            id: "preferredContact",
            label: "Contact Method",
            type: "radio",
            required: true,
          },
          {
            id: "serviceDesired",
            label: "Service Type",
            type: "radio",
            required: true,
          },
          { id: "hasWebsite", label: "Has Website", type: "radio" },
          { id: "websiteAddress", label: "Website Address" },
          { id: "message", label: "Additional Comments" },
        ],
      },
    ];

    let html = "";

    sections.forEach((section) => {
      html += `<div class="review-section"><h3>${section.title}</h3>`;

      section.fields.forEach((field) => {
        let value = "";

        if (field.type === "radio") {
          const radioInput = form.querySelector(
            `input[name="${field.id}"]:checked`
          );
          value = radioInput ? radioInput.value : "";
        } else {
          const input = form.querySelector(`#${field.id}`);
          value = input ? input.value : "";
        }

        const displayValue = value || "Not provided";
        const isEmpty = !value;

        html += `
          <div class="review-item">
            <div class="review-label">${field.label}${
          field.required ? " *" : ""
        }:</div>
            <div class="review-value ${
              isEmpty ? "empty" : ""
            }">${displayValue}</div>
          </div>
        `;
      });

      html += `<button type="button" class="edit-step-btn" onclick="this.getRootNode().host.editStep(${section.step})">Edit ${section.title}</button></div>`;
    });

    reviewContainer.innerHTML = html;
  }

  editStep(stepNumber) {
    // Hide current section
    const currentSection = this.shadowRoot.querySelector(
      `.section[data-step="${this.currentStep}"]`
    );
    currentSection.classList.remove("active");

    // Move to specified step
    this.currentStep = stepNumber;

    // Show target section
    const targetSection = this.shadowRoot.querySelector(
      `.section[data-step="${this.currentStep}"]`
    );
    targetSection.classList.add("active");

    this.updateProgress();
    this.updateNavigation();
  }

  async handleFormSubmit(event) {
    event.preventDefault();

    const form = this.shadowRoot.getElementById("inquiry-form");
    const formData = new FormData(form);
    const formObject = {};

    formData.forEach((value, key) => {
      formObject[key] = value;
    });

    // Add billing address
    formObject.billingAddress = {
      street: this.shadowRoot.getElementById("billingStreet").value || "",
      aptUnit: this.shadowRoot.getElementById("billingAptUnit").value || "",
      city: this.shadowRoot.getElementById("billingCity").value || "",
      state: this.shadowRoot.getElementById("billingState").value || "",
      zipCode: this.shadowRoot.getElementById("billingZipCode").value || "",
      country: this.shadowRoot.getElementById("billingCountry").value || "USA",
    };

    formObject.isFormSubmission = true;

    // Dispatch event
    this.dispatchEvent(
      new CustomEvent("form-submit", {
        bubbles: true,
        composed: true,
        detail: formObject,
      })
    );

    try {
      const apiUrl =
        this.getAttribute("api-url") || "http://localhost:5000/api/leads";

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formObject),
      });

      if (response.ok) {
        this.showToast("Thank you! We'll be in touch soon.");

        // Reset form
        form.reset();
        this.currentStep = 0;
        this.completedSteps.clear();

        // Reset sections
        this.shadowRoot
          .querySelectorAll(".section")
          .forEach((section, index) => {
            section.classList.remove("active");
            if (index === 0) section.classList.add("active");
          });

        this.updateProgress();
        this.updateNavigation();

        this.dispatchEvent(
          new CustomEvent("form-success", {
            bubbles: true,
            composed: true,
            detail: { message: "Form submitted successfully" },
          })
        );
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Server error");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      this.showToast("Error: " + error.message, true);

      this.dispatchEvent(
        new CustomEvent("form-error", {
          bubbles: true,
          composed: true,
          detail: { error: error.message },
        })
      );
    }
  }
}

customElements.define("web-inquiry-form", WebInquiryForm);