import type {
  AboutContent,
  ContactContent,
  HomeContent,
  RatesPageContent,
  TermsContent,
} from "@/lib/types";

export const DEFAULT_HOME: HomeContent = {
  heroTitle: "The Heart of Gold",
  heroSubtitle:
    "We offer competitive rates, premium services, and bespoke gold products tailored to our clients' needs, along with innovative apps and systems designed to enhance efficiency and security.",
  heroCta: "Contact Us",
  heroBackground: "",
  partnersTitle: "Our Trusted Partners",
  partners: [
    { name: "LBMA", logo: "" },
    { name: "Maybank", logo: "" },
    { name: "CIMB", logo: "" },
    { name: "Public Bank", logo: "" },
    { name: "HSBC", logo: "" },
    { name: "Bank Islam", logo: "" },
  ],
  missionTitle: "Mission",
  missionText:
    "We are committed to be the most reliable, transparent and accountable organization.",
  missionImage: "",
  visionTitle: "Vision",
  visionText: "To be one of the leading gold trading companies in Malaysia.",
  visionImage: "",
  coreValueTitle: "Core Value",
  coreValueText: "Integrity, Respect, Responsibility & Efficient",
  coreValueImage: "",
  productsTitle: "Our Product & Services",
  products: [
    { title: "High price buy and sell gold", icon: "exchange" },
    { title: "Collection And Delivery Service", icon: "delivery" },
    { title: "Daily live price from 9.00 am-11.00pm", icon: "clock" },
    { title: "Online booking for buy and sell price", icon: "booking" },
    {
      title: "All Kinds of Gold: Used Jewellery, Gold Bars, Scrap Bars, Mining Gold etc.",
      icon: "diamond",
    },
    { title: "Gold Safekeeping", icon: "safe" },
    {
      title: "We Cover the Entire of Malaysia Including East Malaysia",
      icon: "malaysia",
    },
    { title: "Software Provider", icon: "software" },
  ],
  appTab: "Super Heng Bullion App",
  appTitle: "Super Heng Bullion App",
  appText:
    "Daily settled gold spot ordering on iOS and Android. The official application for registered users to exchange trade information securely.",
  webTab: "Web System",
  webTitle: "Super Heng Bullion Web System",
  webText:
    "A comprehensive platform for buying and selling gold at real-time market prices. Live updates, seamless transactions, and secure management of gold assets.",
};

export const DEFAULT_ABOUT: AboutContent = {
  title: "About Us",
  intro:
    "Super Heng Bullion Sdn. Bhd. is built on standing with our clients through thick and thin. This philosophy reflects our commitment to fostering a supportive environment where our team members collaborate to overcome challenges and deliver exceptional service to our customers. At Super Heng Bullion, we believe in unity, expertise, and turning ambition into gold.",
  heroBackground: "",
  unityTitle: "Unity and Expertise: Turning Ambition Into Gold",
  unityBody:
    "Our directors bring a wealth of experience, deep expertise, and a comprehensive understanding of the gold markets. Backed by determination, dedication, and an extensive network within the gold trade, they have propelled Super Heng Bullion to remarkable success. Since 2021, we have served over 500 customers, earning a reputation as a trusted name in the industry. Our team of dedicated experts is committed to providing unparalleled service, ensuring that our clients receive the best in gold trading. The combined experience and diligence of our directors and staff continue to elevate Super Heng Bullion, solidifying our position as one of the leading gold trading companies.",
  accessTitle: "Accessibility in Gold",
  accessBody:
    "In addition to serving precious metals companies, we actively collaborate with regulatory bodies, government entities, and central banks to streamline the distribution of both physical and digital gold. Our efforts aim to make gold bullion accessible to everyone, breaking down barriers and empowering the general population to invest in this timeless asset.",
  beyondTitle: "Beyond Capabilities",
  beyondBody1:
    "Leading Super Heng Bullion is our founder, Dato' Jeff Kua Kee Koon, a visionary leader with over a decade of experience in the gold industry since 2008. Dato' Jeff Kua recognized the potential for innovation, a method that can revolutionize gold trading, making it more efficient and accessible across Malaysia. Under his leadership, Super Heng Bullion has become a pioneer in the industry, offering seamless gold trading solutions nationwide.",
  beyondBody2:
    "Dato' Jeff Kua's success is not only a testament to his wisdom and insights in the gold trade but also from his elite team and loyal customer network. Together, they have built a company that embodies integrity, capability, and trust in the gold market.",
  beyondBody3:
    "At Super Heng Bullion, we are proud to continue pushing boundaries and setting new standards in the industry.",
  panelImage: "",
};

export const DEFAULT_TERMS: TermsContent = {
  companyName: "Super Heng Bullion Sdn. Bhd.",
  title: "Terms & Conditions of Gold Trading",
  sections: [
    {
      heading: "1. Application of terms and conditions of gold trading",
      body: "These terms and conditions govern the sale and purchase of physical gold (purity level of 99.9% and/or 999.9%), in Ringgit Malaysia (RM) between Super Heng Bullion Sdn. Bhd. (“Super Heng Bullion”) and the customer (“Customer”). By purchasing and/or selling the physical gold from and to Super Heng Bullion, the Customer agrees to be bound by these terms and conditions (“Terms & Conditions”).",
    },
    {
      heading: "2. Interpretation",
      listStyle: "disc",
      items: [
        {
          term: "Customer",
          text: "means the individual or entity who are purchasing and/or selling the Product from the Platform.",
        },
        {
          term: "Conditions",
          text: "mean these Terms and Conditions of Sale.",
        },
        {
          term: "Contract",
          text: "means the offer made by the Customer in relation to the Order and accepted by Super Heng Bullion via an Order Confirmation in accordance with the Terms & Conditions.",
        },
        {
          term: "Product",
          text: "means the physical gold with a purity level of 99.9% and/or 999.9% and any other forms of gold acceptable by Super Heng Bullion, which are made available for purchase or sale on the Platform.",
        },
        {
          term: "Order",
          text: "means all orders, including purchase orders & sell orders.",
        },
        {
          term: "Order Confirmation",
          text: "refers to the confirmation notification sent by the Customer to Super Heng Bullion via the Platform and/or any other written confirmation, including but not limited to emails, text messages and WhatsApp messages sent by the Customer to Super Heng Bullion.",
        },
        {
          term: "Super Heng Bullion Terms and Conditions",
          text: "means these Terms and Conditions of gold trading and all other terms and conditions and policies pertaining to the use of the Platform and/or the Service, which is available on the Platform.",
        },
        {
          term: "Platform",
          text: "means Super Heng Bullion’s official website and/or Super Heng Bullion’s mobile applications;",
        },
        {
          term: "Services",
          text: "means the use of any services, information and functions made available by Super Heng Bullion on the Platform.",
        },
      ],
    },
    {
      heading: "3. Applicable Shariah Contract",
      body: "The respective Shariah contract for the sale and purchase of the Product on the Platform shall be as follows:",
      listStyle: "alpha",
      items: [
        {
          text: "Bai Al-Sarf which refers to a contract of exchange of money with the same or different type. Money is a medium of exchange that shall be in the form of gold, currency notes or coins that have legal tender, or other forms accepted by the principles of Shariah. For this Product, Bai’ Al-Sarf encompasses both the exchange of gold for paper money and vice versa, as well as the exchange of gold for gold. With this method, the payment and delivery for and/or of gold shall be immediate.",
        },
        {
          text: "Wakalah which refers to an agency contract whereby one party, acting as the principal (Muwakkil), mandates and authorizes the other party, acting as the agent (Wakil), to perform specified tasks; subject Shariah principles. With this method, the buyer will appoint the seller as the agent for safekeeping of the gold purchased in case the gold is not delivered in T+0.",
        },
      ],
    },
    {
      heading: "4. Orders and Specifications",
      listStyle: "decimal",
      items: [
        {
          text: "The Customer may place an Order for the Product via the Platform and shall be responsible for ensuring the accuracy of the Orders made.",
        },
        {
          text: "The Customer shall be given an Order Confirmation for every Order made from Super Heng Bullion as an acknowledgement for the Order via the Platform and/or an email or WhatsApp notification.",
        },
        {
          text: "The Customer is able to take physical delivery of the Product. If the Customer requires Super Heng Bullion to safekeep the Product on its behalf, the Customer must complete the safekeeping authorisation letter and submit to Super Heng Bullion.",
        },
        {
          text: "The Customer or its authorized agent may collect the Product from Super Heng Bullion by scheduling an appointment for collection during Super Heng Bullion’s business hours.",
        },
        {
          text: "Super Heng Bullion, in its absolute discretion, may refuse or cancel any Order without giving any reasons for the same to the Customer prior to issuing the Order Confirmation to the Customer.",
        },
        {
          text: "No concluded Contract may be modified or cancelled by the Customer except with prior written consent from Super Heng Bullion.",
        },
        {
          text: "Without prejudice to any other rights or remedies Super Heng Bullion may otherwise have, the Customer shall indemnify, keep indemnified and Super Heng Bullion harmless against any and all liabilities, actions, claims, losses, damages, costs and expenses (including but not limited to legal costs on a full indemnity basis) suffered or incurred by Super Heng Bullion as a result of, or in connection with, any modification and/or cancellation and/or breach by the Customer of the Contract as well as any information provided by the Customer to Super Heng Bullion being inaccurate, outdated or untrue.",
        },
        {
          text: "Until and unless Super Heng Bullion has received full payment, any negative price fluctuation of the Product shall be accountable to the Customer and any positive price fluctuation shall be accountable to Super Heng Bullion.",
        },
        {
          text: "Super Heng Bullion reserves its right to refuse an Order in its absolute discretion, in cases such as non-payment, late payment, dysfunction and unavailability of the Product, without being required to indicate the reason thereof.",
        },
        {
          text: "Once the Order Confirmation has been sent, the Customer cannot cancel the Order.",
        },
        {
          text: "Notwithstanding anything to the contrary provided in the preceding paragraph, if the cancellation of the Customer’s Order by Super Heng Bullion is due to a technical reason, such as a dysfunction of the website and/or the wrong quotation of prices, Super Heng Bullion must notify the Customer of the cancellation within one week of discovering the error and will refund the Customer the amount received, as well as all the transaction fees applicable. If the Product has already been sent, the Customer must return the Product immediately after receiving the cancellation notification.",
        },
        {
          text: "All investments involve some level of risk. If the Customer is considering purchasing precious metals, as an investment, the Customer should assess the current market and seek professional advice. The Customer agrees that Super Heng Bullion does not provide any advice on the opportunity to invest into, disinvest from, or remain invested in, a particular precious metal.",
        },
        {
          text: "The Customer shall provide any information or documents as Super Heng Bullion may require from time to time in its sole discretion for the purpose of Super Heng Bullion validating the information relating to the Customer.",
        },
        {
          text: "The Customer shall notify Super Heng Bullion in writing of any changes to the information provided or being requested by Super Heng Bullion within 30 days of such changes.",
        },
      ],
    },
    {
      heading: "5. Guarantee by Customer",
      listStyle: "decimal",
      items: [
        {
          text: "The Customer (including its directors and shareholders) hereby guarantees to be the debtor for any and all sums owing to Super Heng Bullion for any Order placed on the Platform. The Customer agrees to pay all amounts due promptly and in full, in accordance with the Terms and Conditions herein.",
        },
        {
          text: "In the event that the Customer fails to make any payment when due, the Customer acknowledges and agrees that they shall be liable for any outstanding sums, including any applicable interest, fees, and charges as specified by Super Heng Bullion.",
        },
        {
          text: "The Customer agrees to indemnify and hold harmless Super Heng Bullion from any and all losses, damages, costs, and expenses (including legal fees) arising from or related to the Customer's failure to pay any sums owing under any Order made on the Platform.",
        },
        {
          text: "Super Heng Bullion reserves the right to take any necessary legal action to recover any outstanding sums from the Customer. The Customer agrees to bear all costs associated with such recovery efforts, including but not limited to legal fees and court costs.",
        },
        {
          text: "Super Heng Bullion reserves the right to terminate the Customer's account and access to the Platform and its Services in the event of non-payment or breach of this guarantee clause. The Customer shall remain liable for any sums owing up to the date of termination.",
        },
      ],
    },
    {
      heading: "6. Price",
      body: "The price of the Product shall be the price stated on the Platform at the time which the Customer places and completes the Order on the Platform. The price excludes any applicable sales and service tax, value-added tax or similar tax which the Customer shall be liable to pay to Super Heng Bullion in addition to the price of the Product.",
    },
    {
      heading: "7. Payment Policy",
      body: "The payment from the Customer must originate from the bank account of the Customer who placed the order. The Customer shall be held responsible and will compensate Super Heng Bullion for all fees and costs linked to the refund by Super Heng Bullion of payments made from any third-party accounts, which does not belong to the Customer.",
    },
    {
      heading: "8. Return and Refund",
      listStyle: "decimal",
      items: [
        {
          text: "There are strictly no returns on the Products purchased from the Platform. Notwithstanding, the Customer may apply for the return of the Products only in the following circumstances:",
          subItems: [
            "The Products delivered is defective and/or damaged.",
            "The Products delivered is different from the description provided by Super Heng Bullion in the Platform.",
          ],
          after:
            "In the event that the circumstances under clause 8.1 occurs and/or, the Buyer suspects that the Products delivered has been tampered with or damaged, the Customer must immediately notify Super Heng Bullion’s sales representative upon receipt of the Product, otherwise, it will be considered as accepted upon the expiry of one (1) week from the date of delivery of the Product.",
        },
        {
          text: "All Products sold to customers on the Super Heng Bullion Platform are non-refundable. In the event that an investigation is carried out to determine the claims of a Customer under Clause 8.1 is warranted, Super Heng Bullion will refund the final amount initially paid by the Customer for the Product.",
        },
        {
          text: "The refund will be made to the account used by the Customer for the initial payment. Super Heng Bullion does not permit the Customer to receive the refund via alternative means such as cash or transfer of funds to a different account than the account that was initially used to make payment.",
        },
        {
          text: "All refund processes are expected to take place within 3 to 5 working days.",
        },
      ],
    },
    {
      heading: "9. Market Loss Policy",
      body: "Subject to Clause 4.5 above, the transaction price will be locked-in, and any corresponding market risk is thereafter transferred to the Customer.",
    },
    {
      heading: "10. Force Majeure",
      listStyle: "decimal",
      items: [
        {
          text: "Where Super Heng Bullion is unable to perform any obligation hereunder as a result of any event that is beyond its control, including but not limited to war, strike, crime, act of God, acts of terrorism, or any other circumstances that may cause Super Heng Bullion delay or failure to perform such obligation, Super Heng Bullion shall be excused and shall not be liable for any damages as a result of, or in connection with, such delay or such failure.",
        },
        {
          text: "Super Heng Bullion shall not be liable for any claim arising out of the performance, non-performance, delay in delivery of or defect in the Products nor for any special, indirect, economic or consequential loss or damage howsoever arising or howsoever caused (including loss of profit or loss of revenue) whether from negligence or otherwise in connection with the supply, functioning or use of the Product.",
        },
      ],
    },
    {
      heading:
        "Anti-Money Laundering, Countering Financing of Terrorism and Countering Proliferation Financing",
      listStyle: "decimal",
      items: [
        {
          text: "The Customer agrees to comply with all applicable anti-money laundering laws and regulations of Malaysia, including but not limited to the Anti-Money Laundering, Anti-Terrorism Financing and Proceeds of Unlawful Activities Act 2001 (“AMLA”) when making any transactions on the Platform.",
        },
        {
          text: "The Customer agrees to provide accurate and complete information for the purpose of a customer due diligence as required by the applicable laws. This includes but is not limited to, providing valid identification documents, proof of address, and any other information required by Super Heng Bullion and/or the Platform to verify the Customer’s identity and the source of funds used for the purchase of gold.",
        },
        {
          text: "Super Heng Bullion reserves the right to monitor all transactions by the Customer made on the Platform for suspicious activity.",
        },
        {
          text: "The Customer agrees that Super Heng Bullion will maintain records of all transactions and relevant information in accordance with the applicable laws and regulations.",
        },
        {
          text: "The Customer agrees not to engage in any activities that are considered illegal or suspicious under Anti-Money Laundering/Countering Financing of Terrorism/Countering Proliferation Financing (“AML/CFT/CPF”) laws, including but not limited to money laundering, terrorist financing, proliferation financing and any other activities that may be deemed unlawful.",
        },
        {
          text: "The Customer agrees to cooperate fully with any investigations conducted by Super Heng Bullion or any regulatory or law enforcement authorities concerning AML/CFT/CPF compliance.",
        },
        {
          text: "Super Heng Bullion reserves the right to terminate, freeze, block and/or suspend the Customer’s account and any associated transactions and assets if the Customer is found to be in violation of Clause 11 herein or any applicable AML/CFT/CPF laws and regulations.",
        },
      ],
    },
  ],
};

export const DEFAULT_RATES_PAGE: RatesPageContent = {
  header: "Our Rates",
  headerText: "Check out our rates in real-time.",
  passwordTitle: "Please Enter Your Password",
  passwordLabel: "Password",
  passwordPlaceholder: "Enter your password",
  passwordButton: "Submit",
  passwordHelp: "If you are not able to log in, please contact us at",
};

export const DEFAULT_CONTACT: ContactContent = {
  title: "Contact Us",
  intro: "Submit a query, or contact us directly.",
  companyName: "Super Heng Bullion Sdn Bhd",
  tel: "+603-60642777",
  email: "info@superhengbullion.com",
  address: "No 7, Jalan PPU 2A,\nTaman Perindustrian Puchong Utama,\n47100 Puchong, Selangor.",
  hours: "Office Operating Hours: 9.00am - 6.00pm (Monday - Friday)",
};

export const DEFAULT_PAGES = [
  {
    slug: "home",
    title: "The Heart of Gold",
    description:
      "We offer competitive rates, premium services, and bespoke gold products tailored to our clients' needs.",
    content: DEFAULT_HOME,
  },
  {
    slug: "about",
    title: "About Us",
    description: "Learn about Super Heng Bullion and our commitment to gold trading.",
    content: DEFAULT_ABOUT,
  },
  {
    slug: "terms",
    title: "Terms and Conditions",
    description: "Terms and conditions of gold trading with Super Heng Bullion.",
    content: DEFAULT_TERMS,
  },
  {
    slug: "rates",
    title: "Our Rates",
    description: "Live gold and silver buy and sell rates.",
    content: DEFAULT_RATES_PAGE,
  },
  {
    slug: "contact",
    title: "Contact Us",
    description: "Get in touch with Super Heng Bullion.",
    content: DEFAULT_CONTACT,
  },
] as const;

export const DEFAULT_RATES = [
  {
    metal: "Gold",
    product: "999.9 Gold Bar",
    unit: "RM / Gram",
    buyPrice: 468.5,
    sellPrice: 458.2,
    sortOrder: 1,
  },
  {
    metal: "Gold",
    product: "99.9 Gold Bar",
    unit: "RM / Gram",
    buyPrice: 462.1,
    sellPrice: 451.8,
    sortOrder: 2,
  },
  {
    metal: "Silver",
    product: "999 Fine Silver",
    unit: "RM / Gram",
    buyPrice: 5.85,
    sellPrice: 5.42,
    sortOrder: 3,
  },
];
