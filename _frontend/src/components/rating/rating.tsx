import {TiStar, TiStarFullOutline,  TiStarHalfOutline, TiStarOutline} from "react-icons/ti"

export default function Rating(props: {
    rating: number,
    displayAlt?: boolean
}) {
    let { rating, displayAlt } = props;
    if (!rating) rating = 2.5;

    if (displayAlt) {
        return (
            <div className={'flex w-fit gap-2 items-center'}>
                <TiStar />
                {rating.toFixed(1)}
            </div>
        )
    }
    
    const baseRating = Math.floor(+rating);
    const remainder = rating - baseRating;
    const padding = Math.floor(5 - +rating);
        
	return (
        <div className='flex w-fit gap-1 items-center'>
            {Array(baseRating).fill('').map((_, i) => (
                <TiStarFullOutline key={i} />
            ))}
            {!!remainder && <TiStarHalfOutline />}
            {Array(padding).fill('').map((_, i) => (
                <TiStarOutline className={'text-foreground/10'} key={i} />
            ))}
        </div>
    )
}
