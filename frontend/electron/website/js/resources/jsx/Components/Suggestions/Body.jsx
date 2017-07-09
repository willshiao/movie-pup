import React from "react";

import MovieTable from "./MovieTable.jsx"
import DataTable from "./DataTable.jsx"

export default class Body extends React.Component {
	render() {
		return (
			<div className="section no-pad-bot blue-grey darken-1">
				<MovieTable />
				<DataTable />
			</div>
		);
	}
}
