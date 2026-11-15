import PropTypes from "prop-types";
import { useId, useState } from "react";
import { Plus } from "lucide-react";
export const Accordian = ({ title, content }) => {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className="faq-item">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen(!open)}
        >
          {title}
          <Plus
            size={20}
            aria-hidden="true"
            className={open ? "faq-plus-open" : ""}
          />
        </button>
      </h3>
      <div id={id} hidden={!open}>
        <p>{content}</p>
      </div>
    </div>
  );
};

Accordian.propTypes = {
  title: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
};
