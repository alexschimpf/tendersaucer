function InfoIcon(props) {
    return (
        <span className={"info-icon " + (props.className || '')}>
            <img src="static/images/info-icon.png" width="15px"
                 data-tip={props.message}></img>
        </span>
    )
}

export default InfoIcon;
