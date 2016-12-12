topic: ssl
title: SSL Additional Vetting

Advanced SSL Hurdles
====================

## EVSSL Hurdles (*) means required ##
info> EVSSL gives the green bar. The green bar means something to browsers and SSL vendors - specifically that additional vetting went into the certificate.
info> Not all companies will have an agency registration number in that case the date of incorporation must be used.
notice> EVSSL is not easy to get. There's a lot of confirmation and vetting. You will be going back and forth.
notice> The Requestor is the customer, not us. Same with the Approver and Signer.
notice> During the checkout process, choose to use/deposit funds from the account.


info> We cannot get wildcard EV certs. Wildcard EV certs are not a thing.
info> We can add domains (SAN) to EV certs, but they will go through the Extra Validation proccess like the original domain.
info> We can add subdomains to an EV cert, they are covered by the main domain's Extra Validation.

We recommend using the following response when starting an EV or Org SSL:

```nohighlight
Hello,

For the EV certificate, we also require the following information. Please provide to the best of your ability, and let me know if you have any questions.

Business Type, Choose from:
* Private Organization, e.g. Inc , LLC, PLC , Ltd, GmBH, AS etc.
* Government Entity* City: 
* State/province: 
* Postal code: 

* Business Entity  (Sole trader etc.)
* Non Commercial Entity – e.g. International Organization

* Incorporation agency registration number OR a date of incorporation :
* Country of incorporation:
* State/province of incorporation:
* Municipality of incorporation:

* Street address: 
* Telephone (inc. region code)  :
* Fax (inc. region code)        :

If you are trading under an assumed name please provide it here.
* Business Assumed Name:
* DUNS Number:

Thanks!
```

This SSL request will take time to complete - there is no point to handing it off. Instead, since you started it, you will follow it through to completion. Direct everything you can to a Zendesk ticket, but if GlobalSign needs a number to call or email to email, that is you. You are the PoC for this SSL.



* Business Type choose from:
  *Private Organization, e.g. Inc , LLC, PLC , Ltd, GmBH, AS etc.
  *Government Entity
  *Business Entity  (Sole trader etc.)
  *Non Commercial Entity – e.g. International Organization

* During the Order Process
  * Select Payment Method: Deposit / Funds in Account (should be selected) No PO or comments are necessary
	
* Certificate Details Section 2 – Jurisdiction/Registration Data

Please ensure you only complete the sections of this form that are applicable. Please note that Jurisdiction/Registration varies per country. If you are unsure what to enter then we offer some suggestions in our help guide.

  * Jurisdiction Country		
  * Jurisdiction State/Province 	
  * Jurisdiction Locality	
  * Complete address of business

* Certificate Details Section 3 – Jurisdiction/Registration Serial Number

Please enter the Registration Agency Serial Number of the organization here. If you were not provided a registration number then please enter the date of incorporation. Please note that a Governemnet Entity may write 'Government Entity' here if no date or number is available.

* Incorporation agency registration number
* State/County where registered (sometimes optional)
* City where registered (sometimes optional)

 #Certificate Details Section 4 – Place of Business'''

Please provide the details of your place of business. Generally this will be listed in third party databases such as Dun & Bradstreet or Hoovers and will be verifiable through directory enquiry services.

(items not in usual request form):

  * Telephone (inc. region code)
  * Fax (inc. region code)

* Certificate Details Section 5 – Business Assumed Name – Trading As – Doing Business As etc

If you are trading under an assumed name please provide it here. GlobalSign must be able to verify the name.

  * Business Assumed Name
  * DUNS Number

## Organizational SSL ##

An organizational SSL allows for a certificate to show more detailed information about the company. Ex: Business street address, Phone number, Owner, Etc.

This type of SSL requires full information about the company and a current phone number where they can be reached as during the vetting process Globalsign will contact the business during business hours. Currently this type of SSL can only be ordered through the Globalsign website and requires our Liquidweb account to have a positive balance greater than or equal to the cost of the certificate as the Organizational SSL wont show $0.00 when ordering.

Ordering a Organizational SSL:

1. Start a new SSL order on Globalsign like normal.

2. On the first page tick the Organizational SSL option.

3. Go through the normal SSL creation till you get to the point of contact.

4. The primary point of contact will need to be the customers info as this will be used on the Organizational SSL.

5. Make sure to make our support contact the secondary point of contact so we get order confirmations.

6. You will come to a page to input the business information. Be sure to fill all these fields and confirm them with customer.

7. After you complete the order there will be a link to download a form with all the SSL information on it and a customer signature at the bottom. You will need to provide this to the customer to sign and fax to Globalsign once they contact the customer.

8. After Globalsign contacts the customer and the customer faxes the form the SSL should be generated shortly after.

9. Install the SSL like normal and check that the company information shows when checking the SSL details.
