export default function LegalDisclaimerPage() {
  return (
    <main style={{ maxWidth: 700, margin: '0 auto', padding: 32 }}>
      <h1>Legal Disclaimer</h1>
      <p>This website provides information and reviews on running shoes for informational purposes only. We make no warranties as to the accuracy or currency of the information provided. Products and brand names are used for identification purposes only and do not constitute an endorsement. Use of any information provided on this site is at your own risk.</p>
      <p>&copy; {new Date().getFullYear()} RunShoes Inc.</p>
    </main>
  );
}
