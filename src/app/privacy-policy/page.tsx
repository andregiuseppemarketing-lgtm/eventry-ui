export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <h1 className="text-4xl font-bold gradient-text mb-8">Privacy Policy</h1>
      
      <div className="prose prose-invert max-w-none space-y-6">
        <p className="text-muted-foreground">
          Ultimo aggiornamento: 29 gennaio 2026
        </p>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Titolare del Trattamento</h2>
          <p>
            Eventry ("noi", "ci" o "nostro") è il titolare del trattamento dei tuoi dati personali 
            raccolti attraverso questa piattaforma.
          </p>
          <p>
            Contatto: privacy@eventry.app
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Dati Raccolti</h2>
          <p>Raccogliamo le seguenti categorie di dati personali:</p>
          
          <h3 className="text-xl font-medium mt-4 mb-2">2.1 Dati Identificativi</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Nome e cognome</li>
            <li>Email</li>
            <li>Numero di telefono</li>
            <li>Data di nascita</li>
          </ul>

          <h3 className="text-xl font-medium mt-4 mb-2">2.2 Dati Comportamentali</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Storico partecipazione eventi</li>
            <li>Preferenze musicali e di intrattenimento</li>
            <li>Feedback e valutazioni</li>
            <li>Check-in e orari di arrivo</li>
            <li>Transazioni e acquisti</li>
          </ul>

          <h3 className="text-xl font-medium mt-4 mb-2">2.3 Dati Tecnici</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Indirizzo IP</li>
            <li>Browser e dispositivo</li>
            <li>Cookie e identificatori simili</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">3. Base Giuridica e Finalità</h2>
          
          <h3 className="text-xl font-medium mt-4 mb-2">3.1 Esecuzione del Contratto (Art. 6.1.b GDPR)</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Gestione prenotazioni e liste eventi</li>
            <li>Emissione e validazione biglietti</li>
            <li>Comunicazioni relative all'evento</li>
          </ul>

          <h3 className="text-xl font-medium mt-4 mb-2">3.2 Consenso (Art. 6.1.a GDPR)</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Marketing via email e SMS</li>
            <li>Profilazione per offerte personalizzate</li>
            <li>Condivisione con partner selezionati</li>
          </ul>

          <h3 className="text-xl font-medium mt-4 mb-2">3.3 Legittimo Interesse (Art. 6.1.f GDPR)</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Analisi statistiche anonimizzate</li>
            <li>Sicurezza e prevenzione frodi</li>
            <li>Miglioramento del servizio</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Conservazione dei Dati</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Dati contrattuali:</strong> 10 anni dalla fine del rapporto (obbligo fiscale)
            </li>
            <li>
              <strong>Dati marketing:</strong> fino alla revoca del consenso o 24 mesi di inattività
            </li>
            <li>
              <strong>Cookie tecnici:</strong> massimo 12 mesi
            </li>
            <li>
              <strong>Dati di sicurezza:</strong> 5 anni o fino alla risoluzione di controversie
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Condivisione dei Dati</h2>
          <p>Condividiamo i tuoi dati con:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Organizzatori eventi:</strong> per gestione liste e biglietti</li>
            <li><strong>PR e promoter:</strong> per gestione inviti</li>
            <li><strong>Fornitori di servizi:</strong> hosting, email, analytics</li>
            <li><strong>Autorità:</strong> quando richiesto dalla legge</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">6. I Tuoi Diritti GDPR</h2>
          <p>Hai diritto a:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Accesso (Art. 15):</strong> ottenere una copia dei tuoi dati
            </li>
            <li>
              <strong>Rettifica (Art. 16):</strong> correggere dati inesatti
            </li>
            <li>
              <strong>Cancellazione (Art. 17):</strong> richiedere l'eliminazione dei dati
            </li>
            <li>
              <strong>Limitazione (Art. 18):</strong> limitare il trattamento
            </li>
            <li>
              <strong>Portabilità (Art. 20):</strong> ricevere i dati in formato strutturato
            </li>
            <li>
              <strong>Opposizione (Art. 21):</strong> opporti al trattamento
            </li>
            <li>
              <strong>Revoca consenso (Art. 7.3):</strong> ritirare il consenso in ogni momento
            </li>
          </ul>
          <p className="mt-4">
            Per esercitare i tuoi diritti, visita la{' '}
            <a href="/gdpr" className="text-primary hover:underline">
              pagina GDPR
            </a>
            {' '}o contattaci a privacy@eventry.app
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Sicurezza</h2>
          <p>
            Implementiamo misure tecniche e organizzative appropriate per proteggere i tuoi dati:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Crittografia SSL/TLS per trasmissione dati</li>
            <li>Hash bcrypt per password</li>
            <li>Accesso limitato ai dati personali</li>
            <li>Backup regolari</li>
            <li>Audit log di tutte le operazioni sensibili</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">8. Trasferimenti Internazionali</h2>
          <p>
            I tuoi dati potrebbero essere trasferiti in paesi extra-UE solo se:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Esistono decisioni di adeguatezza della Commissione UE</li>
            <li>Sono applicate garanzie adeguate (Standard Contractual Clauses)</li>
            <li>Hai fornito consenso esplicito</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">9. Cookie e Tracking</h2>
          <p>
            Utilizziamo cookie per migliorare l'esperienza utente. 
            Consulta la nostra{' '}
            <a href="/cookie-policy" className="text-primary hover:underline">
              Cookie Policy
            </a>
            {' '}per dettagli.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">10. Modifiche alla Privacy Policy</h2>
          <p>
            Ci riserviamo il diritto di modificare questa Privacy Policy. 
            Le modifiche sostanziali saranno comunicate via email.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">11. Reclami</h2>
          <p>
            Hai il diritto di presentare reclamo all'Autorità Garante per la Protezione 
            dei Dati Personali:
          </p>
          <p className="mt-2">
            Garante per la protezione dei dati personali<br />
            Piazza Venezia, 11 - 00187 Roma<br />
            Tel: +39 06.696771<br />
            Email: garante@gpdp.it
          </p>
        </section>

        <section className="border-t border-border pt-8 mt-12">
          <p className="text-sm text-muted-foreground">
            Questa Privacy Policy è conforme al Regolamento (UE) 2016/679 (GDPR) e al 
            D.Lgs. 196/2003 (Codice Privacy italiano).
          </p>
        </section>
      </div>
    </div>
  );
}
