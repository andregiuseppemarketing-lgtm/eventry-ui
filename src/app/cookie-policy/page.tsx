export default function CookiePolicyPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <h1 className="text-4xl font-bold gradient-text mb-8">Cookie Policy</h1>
      
      <div className="prose prose-invert max-w-none space-y-6">
        <p className="text-muted-foreground">
          Ultimo aggiornamento: 29 gennaio 2026
        </p>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">Cosa sono i Cookie</h2>
          <p>
            I cookie sono piccoli file di testo che vengono memorizzati sul tuo dispositivo 
            quando visiti un sito web. Vengono utilizzati per migliorare l'esperienza di navigazione 
            e fornire funzionalità essenziali.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">Tipologie di Cookie Utilizzati</h2>
          
          <h3 className="text-xl font-medium mt-6 mb-3">1. Cookie Tecnici (Necessari)</h3>
          <p>
            Questi cookie sono essenziali per il funzionamento del sito e non possono essere disabilitati.
          </p>
          <table className="w-full border-collapse border border-border mt-4">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3">Nome</th>
                <th className="text-left p-3">Scopo</th>
                <th className="text-left p-3">Durata</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="p-3"><code>next-auth.session-token</code></td>
                <td className="p-3">Gestione autenticazione utente</td>
                <td className="p-3">30 giorni</td>
              </tr>
              <tr className="border-b border-border">
                <td className="p-3"><code>next-auth.csrf-token</code></td>
                <td className="p-3">Protezione CSRF</td>
                <td className="p-3">Sessione</td>
              </tr>
              <tr className="border-b border-border">
                <td className="p-3"><code>cookie_consent</code></td>
                <td className="p-3">Memorizza preferenze cookie</td>
                <td className="p-3">12 mesi</td>
              </tr>
            </tbody>
          </table>

          <h3 className="text-xl font-medium mt-6 mb-3">2. Cookie Funzionali</h3>
          <p>
            Permettono funzionalità avanzate e personalizzazione.
          </p>
          <table className="w-full border-collapse border border-border mt-4">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3">Nome</th>
                <th className="text-left p-3">Scopo</th>
                <th className="text-left p-3">Durata</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="p-3"><code>theme_preference</code></td>
                <td className="p-3">Salva tema selezionato (dark/light)</td>
                <td className="p-3">12 mesi</td>
              </tr>
              <tr className="border-b border-border">
                <td className="p-3"><code>language</code></td>
                <td className="p-3">Lingua preferita</td>
                <td className="p-3">12 mesi</td>
              </tr>
            </tbody>
          </table>

          <h3 className="text-xl font-medium mt-6 mb-3">3. Cookie Analytics</h3>
          <p>
            Ci aiutano a capire come i visitatori interagiscono con il sito.
          </p>
          <table className="w-full border-collapse border border-border mt-4">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3">Fornitore</th>
                <th className="text-left p-3">Cookie</th>
                <th className="text-left p-3">Scopo</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="p-3">Vercel Analytics</td>
                <td className="p-3"><code>__vercel_*</code></td>
                <td className="p-3">Statistiche anonimizzate</td>
              </tr>
            </tbody>
          </table>

          <h3 className="text-xl font-medium mt-6 mb-3">4. Cookie di Marketing</h3>
          <p>
            Utilizzati per tracciare campagne e mostrare contenuti personalizzati.
          </p>
          <table className="w-full border-collapse border border-border mt-4">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3">Fornitore</th>
                <th className="text-left p-3">Cookie</th>
                <th className="text-left p-3">Durata</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="p-3">UTM Tracking</td>
                <td className="p-3"><code>utm_*</code></td>
                <td className="p-3">7 giorni</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">Come Gestire i Cookie</h2>
          
          <h3 className="text-xl font-medium mt-4 mb-2">Dal tuo Browser</h3>
          <p>Puoi controllare e/o eliminare i cookie come desideri:</p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>
              <strong>Chrome:</strong> Impostazioni → Privacy e sicurezza → Cookie e altri dati dei siti
            </li>
            <li>
              <strong>Firefox:</strong> Preferenze → Privacy e sicurezza → Cookie e dati dei siti web
            </li>
            <li>
              <strong>Safari:</strong> Preferenze → Privacy → Gestisci dati siti web
            </li>
            <li>
              <strong>Edge:</strong> Impostazioni → Cookie e autorizzazioni sito
            </li>
          </ul>

          <h3 className="text-xl font-medium mt-6 mb-2">Dal nostro Banner</h3>
          <p>
            Puoi modificare le tue preferenze in qualsiasi momento cliccando sul 
            link "Gestisci Cookie" nel footer del sito.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">Cookie di Terze Parti</h2>
          <p>
            Alcuni cookie sono impostati da servizi terzi che appaiono sulle nostre pagine:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>
              <strong>Google Maps:</strong> per visualizzare mappe degli eventi
              <br />
              <a 
                href="https://policies.google.com/privacy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline text-sm"
              >
                Privacy Policy di Google
              </a>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">Conseguenze della Disabilitazione</h2>
          <p>
            La disabilitazione di alcuni cookie può limitare le funzionalità del sito:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>Non potrai rimanere loggato tra le sessioni</li>
            <li>Le preferenze personalizzate non saranno salvate</li>
            <li>Alcune funzionalità potrebbero non funzionare correttamente</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">Aggiornamenti</h2>
          <p>
            Questa Cookie Policy potrebbe essere aggiornata periodicamente per riflettere 
            modifiche alle nostre pratiche o per motivi legali.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">Contatti</h2>
          <p>
            Per domande sui cookie, contattaci a: privacy@eventry.app
          </p>
        </section>

        <section className="border-t border-border pt-8 mt-12">
          <div className="flex gap-4">
            <a 
              href="/privacy-policy" 
              className="text-primary hover:underline"
            >
              Privacy Policy
            </a>
            <a 
              href="/gdpr" 
              className="text-primary hover:underline"
            >
              Impostazioni GDPR
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
