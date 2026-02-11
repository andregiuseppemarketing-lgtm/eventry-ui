export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <h1 className="text-4xl font-bold gradient-text mb-8">Termini e Condizioni di Utilizzo</h1>
      
      <div className="prose prose-invert max-w-none space-y-6">
        <p className="text-muted-foreground">
          Ultimo aggiornamento: 29 gennaio 2026
        </p>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Accettazione dei Termini</h2>
          <p>
            Utilizzando la piattaforma Eventry ("Servizio"), accetti integralmente questi Termini 
            e Condizioni. Se non accetti questi termini, non utilizzare il Servizio.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Descrizione del Servizio</h2>
          <p>
            Eventry è una piattaforma digitale che connette organizzatori di eventi, PR, 
            staff e partecipanti, facilitando:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Creazione e pubblicazione di eventi</li>
            <li>Gestione liste e prenotazioni</li>
            <li>Vendita e distribuzione biglietti</li>
            <li>Check-in digitale tramite QR code</li>
            <li>Sistema di verifica identità</li>
            <li>Analytics e reportistica</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">3. Registrazione e Account</h2>
          
          <h3 className="text-xl font-medium mt-4 mb-2">3.1 Requisiti</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Età minima: 18 anni (o 16 con consenso genitori)</li>
            <li>Email valida e verificabile</li>
            <li>Informazioni veritiere e aggiornate</li>
            <li>Numero di telefono per notifiche (opzionale)</li>
          </ul>

          <h3 className="text-xl font-medium mt-4 mb-2">3.2 Responsabilità Account</h3>
          <p>Sei responsabile di:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Mantenere riservate le credenziali di accesso</li>
            <li>Tutte le attività effettuate tramite il tuo account</li>
            <li>Notificare immediatamente accessi non autorizzati</li>
          </ul>

          <h3 className="text-xl font-medium mt-4 mb-2">3.3 Verifica Identità</h3>
          <p>
            Per funzionalità avanzate (creazione eventi, ruolo PR/Staff), 
            è richiesta la verifica dell'identità tramite documento d'identità valido.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Ruoli Utente e Permessi</h2>
          
          <h3 className="text-xl font-medium mt-4 mb-2">4.1 USER</h3>
          <p>Può partecipare agli eventi, acquistare biglietti, gestire prenotazioni.</p>

          <h3 className="text-xl font-medium mt-4 mb-2">4.2 PR (Public Relations)</h3>
          <p>Può creare liste ospiti, gestire inviti, visualizzare analytics limitati.</p>

          <h3 className="text-xl font-medium mt-4 mb-2">4.3 STAFF</h3>
          <p>Può effettuare check-in, verificare biglietti, gestire accessi.</p>

          <h3 className="text-xl font-medium mt-4 mb-2">4.4 ORGANIZER</h3>
          <p>Può creare eventi, gestire team, accedere a reportistica completa.</p>

          <h3 className="text-xl font-medium mt-4 mb-2">4.5 ADMIN</h3>
          <p>Accesso completo alla piattaforma e gestione utenti.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Biglietti e Pagamenti</h2>
          
          <h3 className="text-xl font-medium mt-4 mb-2">5.1 Tipologie Biglietto</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>FREE_LIST:</strong> Ingresso gratuito con lista nominativa</li>
            <li><strong>DOOR_ONLY:</strong> Pagamento in contanti all'ingresso</li>
            <li><strong>PRE_SALE:</strong> Prevendita online obbligatoria</li>
            <li><strong>FULL_TICKET:</strong> Biglietto prepagato con prevendita + porta</li>
          </ul>

          <h3 className="text-xl font-medium mt-4 mb-2">5.2 Politica Rimborsi</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Biglietti rimborsabili solo se l'evento viene cancellato</li>
            <li>Rimborso automatico entro 14 giorni lavorativi</li>
            <li>Commissioni di servizio non rimborsabili</li>
            <li>Trasferimenti biglietto: a discrezione organizzatore</li>
          </ul>

          <h3 className="text-xl font-medium mt-4 mb-2">5.3 Pagamenti</h3>
          <p>
            I pagamenti sono processati tramite Stripe. Eventry non memorizza 
            dati di carte di credito. Consulta la{' '}
            <a href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</a> 
            {' '}per dettagli.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Condotta Utente</h2>
          
          <h3 className="text-xl font-medium mt-4 mb-2">6.1 Uso Consentito</h3>
          <p>Il Servizio può essere utilizzato solo per scopi legittimi e conformi alla legge.</p>

          <h3 className="text-xl font-medium mt-4 mb-2">6.2 Uso Vietato</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Attività illegali o fraudolente</li>
            <li>Violazione diritti di proprietà intellettuale</li>
            <li>Spam o comunicazioni non richieste</li>
            <li>Reverse engineering della piattaforma</li>
            <li>Automazione tramite bot (salvo autorizzazione)</li>
            <li>Rivendita non autorizzata di biglietti</li>
            <li>Falsificazione di QR code o documenti</li>
            <li>Contenuti offensivi, discriminatori o violenti</li>
          </ul>

          <h3 className="text-xl font-medium mt-4 mb-2">6.3 Sanzioni</h3>
          <p>
            La violazione di questi termini può comportare:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Sospensione temporanea dell'account</li>
            <li>Disabilitazione permanente</li>
            <li>Segnalazione alle autorità competenti</li>
            <li>Azioni legali per danni</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Proprietà Intellettuale</h2>
          
          <h3 className="text-xl font-medium mt-4 mb-2">7.1 Contenuti Eventry</h3>
          <p>
            Tutti i contenuti della piattaforma (logo, design, codice, testi) 
            sono di proprietà di Eventry e protetti da copyright.
          </p>

          <h3 className="text-xl font-medium mt-4 mb-2">7.2 Contenuti Utente</h3>
          <p>
            Caricando contenuti (foto eventi, descrizioni), concedi a Eventry 
            una licenza non esclusiva per utilizzarli nella piattaforma e per 
            scopi promozionali.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">8. Limitazione di Responsabilità</h2>
          
          <h3 className="text-xl font-medium mt-4 mb-2">8.1 Servizio "As Is"</h3>
          <p>
            Il Servizio è fornito "così com'è" senza garanzie di alcun tipo. 
            Non garantiamo disponibilità continua o assenza di errori.
          </p>

          <h3 className="text-xl font-medium mt-4 mb-2">8.2 Eventi di Terzi</h3>
          <p>
            Eventry è una piattaforma intermediaria. Non siamo responsabili per:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Qualità o sicurezza degli eventi</li>
            <li>Comportamento di organizzatori o partecipanti</li>
            <li>Danni o infortuni durante eventi</li>
            <li>Cancellazioni o modifiche eventi</li>
          </ul>

          <h3 className="text-xl font-medium mt-4 mb-2">8.3 Limiti di Responsabilità</h3>
          <p>
            La nostra responsabilità è limitata all'importo pagato per il 
            servizio negli ultimi 12 mesi (massimo €100).
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">9. Risoluzione Controversie</h2>
          
          <h3 className="text-xl font-medium mt-4 mb-2">9.1 Foro Competente</h3>
          <p>
            Per controversie si applica la legge italiana e il foro competente 
            è quello di Milano, Italia.
          </p>

          <h3 className="text-xl font-medium mt-4 mb-2">9.2 Mediazione</h3>
          <p>
            Prima di azioni legali, le parti si impegnano a tentare una 
            risoluzione amichevole tramite mediazione.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">10. Modifiche ai Termini</h2>
          <p>
            Ci riserviamo il diritto di modificare questi Termini in qualsiasi momento. 
            Le modifiche sostanziali saranno comunicate via email con 30 giorni di preavviso.
          </p>
          <p className="mt-2">
            L'uso continuato del Servizio dopo le modifiche costituisce accettazione 
            dei nuovi termini.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">11. Contatti</h2>
          <p>
            Per domande su questi Termini, contattaci a:
          </p>
          <p className="mt-2">
            <strong>Email:</strong> legal@eventry.app<br />
            <strong>Supporto:</strong> support@eventry.app<br />
            <strong>Sede Legale:</strong> Milano, Italia
          </p>
        </section>

        <section className="border-t border-border pt-8 mt-12">
          <p className="text-sm text-muted-foreground">
            Questi Termini e Condizioni sono conformi al Codice del Consumo italiano 
            (D.Lgs. 206/2005) e alla normativa europea applicabile.
          </p>
        </section>
      </div>
    </div>
  );
}
