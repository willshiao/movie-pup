import React from "react";

export default class MovieCard extends React.Component {
	render() {
		return (
            <div className="col s3">
                <div className="card">
                    <div className="card-image waves-effect waves-block waves-light">
                        <img className="activator" src="https://assets.mubi.com/images/notebook/post_images/22621/images-w1400.jpg" />
                    </div>
                    <div className="card-content">
                        <span className="card-title activator grey-text text-darken-4">Moonlight<i className="material-icons right">more_vert</i></span>
                        <p><a href="#">This is a link</a></p>
                    </div>
                    <div className="card-reveal">
                        <span className="card-title grey-text text-darken-4">Moonlight<i className="material-icons right">close</i></span>
                        <p>A look at three defining chapters in the life of Chiron, a young black man growing up in Miami. His epic journey to manhood is guided by the kindness, support and love of the community that helps raise him.</p>
                    </div>
                </div>
            </div>
		);
	}
}
