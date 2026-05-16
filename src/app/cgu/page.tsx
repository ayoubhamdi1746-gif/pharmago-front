export default function CGULegalPage() {
  return (
    <div className="min-h-screen bg-[#020814] text-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-semibold mb-8 text-[#00D4AA]">Conditions Générales d'Utilisation</h1>
        <div className="space-y-6 text-sm text-[#E2E8F0] leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Objet</h2>
            <p>PharmaGo est une plateforme de gestion et de livraison de médicaments pour pharmacies. Les présentes CGU régissent l'utilisation du service par les pharmacies, patients et livreurs.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. Acceptation</h2>
            <p>En utilisant PharmaGo, vous acceptez d'être lié par ces conditions. Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser le service.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. Pharmacie partenaire</h2>
            <p>La pharmacie partenaire est responsable de la vérification des ordonnances et de l'approbation des livraisons. PharmaGo ne peut être tenu responsable des erreurs de délivrance.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. Protection des données</h2>
            <p>Toutes les données patients sont chiffrées (AES-256) et hébergées en Europe. Nous respectons le RGPD et ne partageons jamais vos données avec des tiers à des fins marketing.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. Sécurité des livraisons</h2>
            <p>Chaque livraison est protégée par un code OTP unique. Le livreur doit confirmer la réception avec le code fourni au patient. PharmaGo ne peut être tenu responsable des livraisons refusées par le patient.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. Paiement</h2>
            <p>Les abonnements sont facturés mensuellement. Le paiement est traité par nos partenaires Konnect et Flouci. PharmaGo ne stocke pas vos données bancaires.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. Limitation de responsabilité</h2>
            <p>PharmaGo ne peut être tenu responsable des dommages indirects. La responsabilité maximale est limitée au montant de votre abonnement mensuel.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">8. Contact</h2>
            <p>Pour toute question, contactez-nous à <span className="text-[#00D4AA]">contact@pharmago.tn</span></p>
          </section>
        </div>
        <div className="mt-12 pt-8 border-t border-[#00D4AA]/20 text-xs text-[#64748B]">
          Dernière mise à jour : Mai 2026 · PharmaGo v0.1
        </div>
      </div>
    </div>
  );
}