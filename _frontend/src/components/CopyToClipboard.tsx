import {useState} from "react";
import {Button, ButtonProps} from "@/components/ui/button.tsx";
import {FaCheck} from "react-icons/fa6";
import {HiOutlineDocumentDuplicate} from "react-icons/hi2";
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
        <Button {...buttonProps} variant={'outline'} onClick={handleClick}>
            {showCopied ? (
                <>
                    Copied <FaCheck/>
                </>
            ) : (
                <>
                    Copy to clipboard <HiOutlineDocumentDuplicate/>
                </>
            )}
        </Button>
    )
}