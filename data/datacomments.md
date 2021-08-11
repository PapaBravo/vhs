# Sources

VHS courses 
* Open Data Portal https://daten.berlin.de/datensaetze/kurse-der-berliner-volkshochschulen
* Deep Link https://vhsit.berlin.de/VHSKURSE/OpenData/Kurse.json

# Problems
## `veranstaltungsort.name`
The name does not refer to a unique location. The name `VHS` is used several times with different addresses.

Ideally, an ID for every official location would be used. This location could be in a different dataset and already be geocoded.

## `veranstaltungsort.strasse`
The address fields are not always clean. Examples

* 592360, "strasse": "Ella-Barowsky-Str. 62, 10829 Berlin"
* 598444, "strasse": "John-F.-Kennedy-Platz"
* 602416, "strasse": "Eiswerderstr.7"
* 603050, "strasse": "Goethestr. 9-11 (Lichterfelde)"
* 594169, "strasse": "Hermannstr. 158 A (Eingang Arztpraxen)"

An additional field `hint` would help clean up the data while keeping all information.