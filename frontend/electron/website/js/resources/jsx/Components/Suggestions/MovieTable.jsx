import React from "react";
import Axios from "axios";

import MovieCard from "./MovieCard.jsx"

export default class MovieTable extends React.Component {

    constructor() {
        super();
        this.state = {
            items: []
        };
    }

    componentDidMount() {
        axios.post('http://35.163.36.100/history', {
            firstName: 'Fred',
            lastName: 'Flintstone'
        }).then(function(response) {
            this.setState({items: response.json()});
        }).catch(function(error) {
            console.log(error);
        });
    }

    render() {
        return (
            <div className="container">
                <h4 className="white-text" style={{
                    fontWeight: "600"
                }}>
                    YOUR SUGGESTIONS
                </h4>
                <div className="row">
                    <MovieCard/>
                    <MovieCard/>
                    <MovieCard/>
                    <MovieCard/>
                </div>
            </div>
        );
    }
}
