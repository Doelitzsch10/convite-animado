import Modal from "./Modal";
import RsvpForm from "./RsvpForm";

export default function RsvpModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal titulo="CONFIRMAR PRESENÇA" onClose={onClose}>
      <RsvpForm />
    </Modal>
  );
}
