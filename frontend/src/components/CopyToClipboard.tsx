import {useState} from "react";
import {ButtonProps} from "@/components/ui/button.tsx";
import {FaCheck} from "react-icons/fa6";
import {HiOutlineDocumentDuplicate} from "react-icons/hi2";
import ButtonVariant from "@/components/Button/Button.tsx"
import {copyToClipboard} from "@/lib/utils.ts";

export function CopyToClipboard(props: Partial<ButtonProps> & {
    text: string
}) {
    const {text, ...buttonProps} = props;
    const [showCopied, setShowCopied] = useState(false);

    const handleClick = () => {
        copyToClipboard(text).then();
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000);
    }
    return (
        <ButtonVariant.Outline {...buttonProps} onClick={handleClick}>
            {showCopied ? (
                <>
                    Copied <FaCheck/>
                </>
            ) : (
                <>
                    Copy to clipboard <HiOutlineDocumentDuplicate/>
                </>
            )}
        </ButtonVariant.Outline>
    )
}