import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CSVLink } from "react-csv";
import { __ } from '@wordpress/i18n';
import { Link } from 'react-router-dom';
import "./style.scss";

const Import = () => {
    //To fetch all the data for the sample CSV
    useEffect( () => {
        if ( appLocalizer.pro_active != 'free' ) {
            axios({
                method: "post",
                url: `${ appLocalizer.apiUrl }/stockmanager/v1/get-products`,
                headers: { 'X-WP-Nonce' : appLocalizer.nonce },
                data:{ allData:'true' },
            } ).then( ( response ) => {
                let parsedData = JSON.parse( response.data );
                setData( parsedData ); 
            } );
        }
    }, []);
    const [ data, setData ] = useState([]);
    const [ file, setFile ] = useState( null );
    const [ filename, setFilename ] = useState( "" );
    const [ displayMessage, setDisplayMessage ] = useState( '' );
    const handleFileChange = ( event ) => {
        setFile( event.target.files[0] );
        setFilename( event.target.files[0].name )
    };

    //Headers to generate the Sample CSV
    const header = [
        { label: 'SKU'          , key: 'sku' },
        { label: 'Manage stock' , key: 'manage_stock' },
        { label: 'Stock status' , key: 'stock_status' },
        { label: 'Backorders'   , key: 'backorders' },
        { label: 'Stock'        , key: 'stock_quantity' },
    ];

    //Function that process the csv
    const processCSV = (str, delim = ',') => {
        const headers = str.slice( 0, str.indexOf( '\n' ) ).split( delim );
        const rows = str.slice( str.indexOf( '\n' ) + 1 ).split( '\n' );
        const processedCsvData = rows.map( row => {
            const values = row.split( delim );
            const eachObject = headers.reduce( ( obj, header, i ) => {
                obj[ header ] = values[ i ];
                return obj;
            }, { })
            return eachObject;
        })
        return processedCsvData;
    };

    //Function to upload the CSV data
    const handleUpload = () => {
        if ( file ) {
            const reader = new FileReader();
            reader.readAsText( file  );
            reader.onload = function ( e ) {
                let csvData = processCSV( e.target.result );
                axios({
                    method: 'post',
                    url: `${ appLocalizer.apiUrl }/stockmanager/v1/import-products`,
                    headers: { 'X-WP-Nonce' : appLocalizer.nonce, 'Content-Type': 'application/json' },
                    data: { product: csvData }
                })
                setDisplayMessage('Csv Data Uploaded Succesfully');
                setTimeout( () => {
                    setDisplayMessage( '' );
                }, 2000 );
            }
        }
    };

    return (
        <div className="woo-container">
            <div className='import-page'>
                <div className="woo-page-title">
                    <p>{ __( 'Import', 'woocommerce-stock-manager' ) }</p>
                    <button class="import-export-btn" >
                        <Link to={ '?page=woo-stock-manager-setting#&tab=manage-stock' }>
                            <div className='wp-menu-image dashicons-before dashicons-arrow-left-alt'></div>
                            { __( "Inventory Manager", "woocommerce-stock-manager" ) }
                        </Link>
                    </button>
                    {
                        displayMessage &&
                        <div className="woo-notic-display-title">
                            <i className="icon-success-notification"></i>
                            { displayMessage }
                        </div>
                    }
                </div>
                <div className="import-section">
                    <p>{ __( 'Upload your CSV file to update stock data for existing products. The file must match the specified format a sample CSV is available for reference.', 'woocommerce-stock-manager' ) }
                    {
                        data &&
                        <CSVLink enclosingCharacter={ `` } data={ Object.values( data ) } headers={ header } filename={ 'Sample.csv' }>{ __( 'Download Sample CSV', 'woocommerce-stock-manager' ) }</CSVLink>
                    }
                    </p>
                    <div className='import-table'>                        
                        <div className='import-csv-section'>
                            <div className='dashicons dashicons-format-image'></div>
                            <p>{ filename !== "" ? filename : "Drag your file here or click in this area" }</p>
                            <input className='import-input' onChange={ handleFileChange } type="file" name="csv_file" accept=".csv" />
                        </div>
                        <div className='import-upload-btn-section'>
                            <button onClick={ handleUpload } class="import-btn">{ __( 'Upload CSV', 'woocommerce-stock-manager' ) }</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Import;