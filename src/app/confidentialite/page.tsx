export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-[#020814] text-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-semibold mb-8 text-[#00D4AA]">Politique de Confidentialité</h1>
        <div className="space-y-6 text-sm text-[#E2E8F0] leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Collecte des données</h2>
            <p>PharmaGo collecte uniquement les données nécessaires au fonctionnement du service : informations de la pharmacie, données patients pour les ordonnances, et informations des livreurs pour les livraisons.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. Chiffrement</h2>
            <p>Toutes les données sensibles sont chiffrées avec AES-256. Les adresses des patients et les détails des ordonnances ne sont jamais stockés en clair.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. Stockage</h2>
            <p>Les données sont hébergées sur des serveurs sécurisés en Europe, conformes au RGPD. Nous ne transférons pas vos données en dehors de l'UE.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. Partage</h2>
            <p>Vos données ne sont jamais vendues. Elles sont partagées uniquement avec : la pharmacie concernée (pour la vérification) et le livreur (uniquement pour la livraison en cours).</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. Droits</h2>
            <p>Vous pouvez demander l'accès, la rectification ou la suppression de vos données à tout moment en écrivant à contact@pharmago.tn. Nous répondons sous 30 jours.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. Cookies</h2>
            <p>Nous utilisons des cookies essentiels pour le fonctionnement du service (authentification, préférences). Aucune donnée n'est utilisée à des fins publicitaires.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. Sécurité</h2>
            <p>Notre infrastructure est protégée par un pare-feu, rate limiting et monitoring 24/7. En cas de violation de données, vous serez notifié sous 72 heures.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">8. Contact DPO</h2>
            <p>Responsable protection des données : <span className="text-[#00D4AA]">contact@pharmago.tn</span></p>
          </section>
        </div>
        <div className="mt-12 pt-8 border-t border-[#00D4AA]/20 text-xs text-[#64748B]">
          Dernière mise à jour : Mai 2026 · PharmaGo v0.1
        </div>
      </div>
    </div>
  );
}