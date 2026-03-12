# Project Context
You are acting as the lead developer for a web system hosted on Railway. Our stack communicates with Redash for data analysis. In the future, it will also communicate with the OpenAI API for message intelligence and an email service for support escalation. 

**IMPORTANT FOCUS:** For now, focus STRICTLY on the immediate tasks (backend services for Redash integration and the message routing logic). Do not build the frontend. The tasks listed under "Future Backlog" MUST NOT be implemented right now; they are shared solely so you can design the architecture (e.g., modular services, controllers, database schemas) with these future requirements in mind.

Please implement the Immediate Tasks in order. Notify me when each step is completed so we can validate before moving forward.

---

## 🎯 IMMEDIATE TASKS (TO BE IMPLEMENTED NOW)

### Task 1: Redash Integration and Data Update
1. Create a generic HTTP integration service for Redash. It must make `POST` requests to the endpoint `/api/queries/{query_id}/results`, authenticated via headers using the `REDASH_API_KEY` environment variable.
2. The system must receive the user's username and make a call to **Query 1464**.
3. The reference base URL to understand the parameter is: `https://reports.eldorado.io/queries/1464/source?p_user=USERNAME`. Therefore, in the request body (payload), pass the object: `{"parameters": {"p_user": "USERNAME"}}`.
4. The response JSON will contain the following columns: `email`, `firstName`, `vol_total`, `vol_30d`, `tx_total`, `tx_30d`, `rank_vol_total`, `rank_vol_30d`, `rank_tx_total`, and `rank_tx_30d`.
5. Extract the `email` and `firstName` fields and update the user's table in the local database with this information.

### Task 2: Engagement Rules Engine (Message Routing)
1. Using the data returned from the same **Query 1464**, use the exact variables to route the user's messaging flow:
   * **Inactive Flow:** If the `tx_total` column is `0`, return the "first transaction" flow/message.
   * **Warmup Flow:** If the `tx_total` column is `> 0` and `<= 3`, return a message offering help to reach their first 5 transactions (address the user by their `firstName` if possible).
   * **VIP Flow:** If the user is in the top 10% for volume (`rank_vol_total <= 10`) OR top 10% for transactions (`rank_tx_total <= 10`), return a congratulatory VIP message informing them of this status.

---

## 📅 FUTURE BACKLOG (DO NOT IMPLEMENT NOW - FOR ARCHITECTURAL CONTEXT ONLY)

The following tasks are for future development. Keep them in mind so your current code structure (like service interfaces and controllers) can easily accommodate them later.

### Task 3 (Future): Intent Analysis with OpenAI
1. Set up a service for the OpenAI API using the `OPENAI_API_KEY` environment variable.
2. Create a function that takes the user's text reply (in response to the messages from Task 2) and sends it to OpenAI with a strict System Prompt: *"You are a support classifier. Read the user's message. If it reports a technical problem, bug, error, or dissatisfaction with the app, reply ONLY with the word 'PROBLEMA'. Otherwise, reply 'OUTRO'."*
3. If the AI replies 'PROBLEMA', trigger the "Humanized Support Flow".

### Task 4 (Future): Humanized Support Flow & Escalation
1. Ask the user: *"Would you like me to request one of our staff members to contact you within 1 hour to help resolve this situation?"*
2. Process the user's reply (Yes/No):
   * **If "No":** Log the refusal in the DB and reply: *"Alright, I will keep your message noted here to help us improve."*
   * **If "Yes":** * Reply: *"Ok, I will send you an email with a copy of your request. I am alerting the support team right now. We apologize for the inconvenience and thank you for reaching out."*
     * Trigger an email dispatch service (via SMTP or API).
     * Send an urgent alert to the internal support team's email with the user's details (`username`, `firstName`, `email`, and original message).
     * Send a copy to the user's email confirming the request.

---

## 🏗️ Architectural & Coding Rules:
* **Error Handling:** Implement robust `try/catch` blocks for all external integrations (like the Redash calls) to prevent app crashes on Railway.
* **Environment Variables:** All base URLs, API keys, and credentials must use environment variables. Absolutely no hardcoded secrets.
* **Separation of Concerns:** Strictly isolate responsibilities. Use `Services` for external HTTP calls/integrations and `Controllers` for the business/routing logic described in Task 2.