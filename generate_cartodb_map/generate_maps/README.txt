This directory generates a .CSV file to be uploaded to carto.com.

In the future it might use carto.com APIs to automate the process.

Input:
 * Generated smelly information (see the file smell_hits.py) (this file
   was generated by Deb and shared in Dropbox).
 * Generated borough information location (see the file
   generate_boroughs/location_data_all.csv .csv) (this file
   is generated by generate_boroughs code)).

Output:
 * carto.csv. Format:
latitude, longitude, year, location_name, number_of_smells

The locations.csv is the file that is uploaded to carto.com to be
plotted.

Instructions to upload to carto.com:
 # TO DO
