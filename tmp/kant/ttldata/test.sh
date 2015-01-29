rm -f test.data
touch test.data
echo "hello, my \"name\" is toto" >> test.data
echo "hello, my \"name\" is tutu" >> test.data

isql 1111 dba dba exec="grant select on \"DB.DBA.SPARQL_SINV_2\" to \"SPARQL\";"
isql 1111 dba dba exec="grant execute on \"DB.DBA.SPARQL_SINV_IMP\" to \"SPARQL\";"



