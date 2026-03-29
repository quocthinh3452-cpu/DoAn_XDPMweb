/* BackButton.jsx — unified back-navigation button
   Replaces all ad-hoc <button onClick={onBack}> in checkout steps.
   Uses .back-btn from buttons.css.
*/

const ChevronLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

export default function BackButton({ onClick, label = "Back" }) {
  return (
    <button type="button" onClick={onClick} className="back-btn">
      <ChevronLeft />
      {label}
    </button>
  );
}