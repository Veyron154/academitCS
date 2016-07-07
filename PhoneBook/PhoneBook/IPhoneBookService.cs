﻿using System.Collections.Generic;
using System.IO;
using System.ServiceModel;
using System.ServiceModel.Web;

namespace PhoneBook
{
    [ServiceContract]
    public interface IPhoneBookService
    {
        [OperationContract]
        [WebInvoke(Method = "POST", BodyStyle = WebMessageBodyStyle.WrappedRequest, 
                   RequestFormat = WebMessageFormat.Json, ResponseFormat = WebMessageFormat.Json)]
        void AddContact (ContactDto contact);

        [OperationContract]
        [WebInvoke(Method = "POST", BodyStyle = WebMessageBodyStyle.WrappedRequest,
            RequestFormat = WebMessageFormat.Json, ResponseFormat = WebMessageFormat.Json)]
        List<ContactDto> GetContacts();

        [OperationContract]
        [WebInvoke(Method = "POST", BodyStyle = WebMessageBodyStyle.WrappedRequest,
                   RequestFormat = WebMessageFormat.Json, ResponseFormat = WebMessageFormat.Json)]
        void RemoveContact(ContactDto contact);

        [OperationContract]
        [WebInvoke(Method = "GET", BodyStyle = WebMessageBodyStyle.WrappedRequest,
                   RequestFormat = WebMessageFormat.Json, ResponseFormat = WebMessageFormat.Json, 
                    UriTemplate = "/Excel?filter={filter}")]
        Stream GetExcel(string filter);
    }
}