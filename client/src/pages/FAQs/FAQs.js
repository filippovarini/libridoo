import React, { Component } from "react";
import HeaderPart from "../../components/headerPart";
import "./FAQs.css";

class FAQs extends Component {
  state = {
    "1": false,
    "2": false,
    "3": false,
    "4": false,
    "5": false,
    "6": false,
    "7": false
  };

  toggleSlide = faq => {
    this.setState({
      [faq]: !this.state[faq]
    });
  };

  render() {
    return (
      <div id="faqs">
        <HeaderPart
          title={"FAQs"}
          mainClass={"faqs"}
          imageId="libridoo-logo-image"
          headerClass=""
        />
        <p id="faqs-header">Domande frequenti</p>
        <div id="faqs-container">
          <div
            className="faq-container"
            onClick={() => {
              this.toggleSlide("1");
            }}
          >
            <div className="faq">
              <p id="1" className="faq-header">
                Come si fa a respirare?
              </p>
              <i
                onClick={() => {
                  this.toggleSlide("1");
                }}
                className={`fa fa-${
                  this.state["1"] ? "minus" : "plus"
                } faq-ico`}
              ></i>
            </div>
            <p className={`faq-answer ${this.state["1"] ? "" : "hidden"}`}>
              lorem Labore non qui elit aute do aliquip ex sint. Amet
              adipisicing do tempor quis labore excepteur sunt cupidatat. Velit
              esse officia pariatur veniam est Sit ea occaecat qui deserunt ex
              veniam. In commodo sit reprehenderit fugiat exercitation do
              exercitation quis consectetur. Voluptate qui aute consectetur
              officia ullamco consequat aliquip nisi cillum sint labore id
              occaecat veniam. Pariatur sit adipisicing veniam esse aliquip anim
              mollit reprehenderit id et incididunt sit fugiat non. Duis
              consectetur ea magna ex ex ut est tempor. Irure ea magna sint do.
              Aute ipsum commodo ullamco cupidatat amet minim esse in. Velit
              nulla reprehenderit minim anim esse qui ad ea commodo proident.
              Exercitation elit elit qui aliqua ullamco. Ullamco magna
              consectetur culpa consequat non nisi ullamco veniam cillum nostrud
              adipisicing deserunt. Consectetur mollit non consequat sunt labore
              nostrud consequat sint nisi ad labore enim anim. Exercitation
              nostrud cillum nisi fugiat est amet exercitation non voluptate
              aliquip eiusmod. Magna in laboris veniam consequat ad nulla
              labore.
            </p>
          </div>
          <div
            className="faq-container"
            onClick={() => {
              this.toggleSlide("2");
            }}
          >
            <div className="faq">
              <p id="2" className="faq-header">
                Come si fa a respirare?
              </p>
              <i
                onClick={() => {
                  this.toggleSlide("2");
                }}
                className={`fa fa-${
                  this.state["2"] ? "minus" : "plus"
                } faq-ico`}
              ></i>
            </div>
            <p className={`faq-answer ${this.state["2"] ? "" : "hidden"}`}>
              lorem Labore non qui elit aute do aliquip ex sint. Amet
              adipisicing do tempor quis labore excepteur sunt cupidatat. Velit
              esse officia pariatur veniam est Sit ea occaecat qui deserunt ex
              veniam. In commodo sit reprehenderit fugiat exercitation do
              exercitation quis consectetur. Voluptate qui aute consectetur
              officia ullamco consequat aliquip nisi cillum sint labore id
              occaecat veniam. Pariatur sit adipisicing veniam esse aliquip anim
              mollit reprehenderit id et incididunt sit fugiat non. Duis
              consectetur ea magna ex ex ut est tempor. Irure ea magna sint do.
              Aute ipsum commodo ullamco cupidatat amet minim esse in. Velit
              nulla reprehenderit minim anim esse qui ad ea commodo proident.
              Exercitation elit elit qui aliqua ullamco. Ullamco magna
              consectetur culpa consequat non nisi ullamco veniam cillum nostrud
              adipisicing deserunt. Consectetur mollit non consequat sunt labore
              nostrud consequat sint nisi ad labore enim anim. Exercitation
              nostrud cillum nisi fugiat est amet exercitation non voluptate
              aliquip eiusmod. Magna in laboris veniam consequat ad nulla
              labore.
            </p>
          </div>
          <div
            className="faq-container"
            onClick={() => {
              this.toggleSlide("3");
            }}
          >
            <div className="faq">
              <p id="3" className="faq-header">
                Come si fa a respirare?
              </p>
              <i
                onClick={() => {
                  this.toggleSlide("3");
                }}
                className={`fa fa-${
                  this.state["3"] ? "minus" : "plus"
                } faq-ico`}
              ></i>
            </div>
            <p className={`faq-answer ${this.state["3"] ? "" : "hidden"}`}>
              lorem Labore non qui elit aute do aliquip ex sint. Amet
              adipisicing do tempor quis labore excepteur sunt cupidatat. Velit
              esse officia pariatur veniam est Sit ea occaecat qui deserunt ex
              veniam. In commodo sit reprehenderit fugiat exercitation do
              exercitation quis consectetur. Voluptate qui aute consectetur
              officia ullamco consequat aliquip nisi cillum sint labore id
              occaecat veniam. Pariatur sit adipisicing veniam esse aliquip anim
              mollit reprehenderit id et incididunt sit fugiat non. Duis
              consectetur ea magna ex ex ut est tempor. Irure ea magna sint do.
              Aute ipsum commodo ullamco cupidatat amet minim esse in. Velit
              nulla reprehenderit minim anim esse qui ad ea commodo proident.
              Exercitation elit elit qui aliqua ullamco. Ullamco magna
              consectetur culpa consequat non nisi ullamco veniam cillum nostrud
              adipisicing deserunt. Consectetur mollit non consequat sunt labore
              nostrud consequat sint nisi ad labore enim anim. Exercitation
              nostrud cillum nisi fugiat est amet exercitation non voluptate
              aliquip eiusmod. Magna in laboris veniam consequat ad nulla
              labore.
            </p>
          </div>
          <div
            className="faq-container"
            onClick={() => {
              this.toggleSlide("4");
            }}
          >
            <div className="faq">
              <p id="4" className="faq-header">
                Come si fa a respirare?
              </p>
              <i
                onClick={() => {
                  this.toggleSlide("4");
                }}
                className={`fa fa-${
                  this.state["4"] ? "minus" : "plus"
                } faq-ico`}
              ></i>
            </div>
            <p className={`faq-answer ${this.state["4"] ? "" : "hidden"}`}>
              lorem Labore non qui elit aute do aliquip ex sint. Amet
              adipisicing do tempor quis labore excepteur sunt cupidatat. Velit
              esse officia pariatur veniam est Sit ea occaecat qui deserunt ex
              veniam. In commodo sit reprehenderit fugiat exercitation do
              exercitation quis consectetur. Voluptate qui aute consectetur
              officia ullamco consequat aliquip nisi cillum sint labore id
              occaecat veniam. Pariatur sit adipisicing veniam esse aliquip anim
              mollit reprehenderit id et incididunt sit fugiat non. Duis
              consectetur ea magna ex ex ut est tempor. Irure ea magna sint do.
              Aute ipsum commodo ullamco cupidatat amet minim esse in. Velit
              nulla reprehenderit minim anim esse qui ad ea commodo proident.
              Exercitation elit elit qui aliqua ullamco. Ullamco magna
              consectetur culpa consequat non nisi ullamco veniam cillum nostrud
              adipisicing deserunt. Consectetur mollit non consequat sunt labore
              nostrud consequat sint nisi ad labore enim anim. Exercitation
              nostrud cillum nisi fugiat est amet exercitation non voluptate
              aliquip eiusmod. Magna in laboris veniam consequat ad nulla
              labore.
            </p>
          </div>
          <div
            className="faq-container"
            onClick={() => {
              this.toggleSlide("5");
            }}
          >
            <div className="faq">
              <p id="5" className="faq-header">
                Come si fa a respirare?
              </p>
              <i
                onClick={() => {
                  this.toggleSlide("5");
                }}
                className={`fa fa-${
                  this.state["5"] ? "minus" : "plus"
                } faq-ico`}
              ></i>
            </div>
            <p className={`faq-answer ${this.state["5"] ? "" : "hidden"}`}>
              lorem Labore non qui elit aute do aliquip ex sint. Amet
              adipisicing do tempor quis labore excepteur sunt cupidatat. Velit
              esse officia pariatur veniam est Sit ea occaecat qui deserunt ex
              veniam. In commodo sit reprehenderit fugiat exercitation do
              exercitation quis consectetur. Voluptate qui aute consectetur
              officia ullamco consequat aliquip nisi cillum sint labore id
              occaecat veniam. Pariatur sit adipisicing veniam esse aliquip anim
              mollit reprehenderit id et incididunt sit fugiat non. Duis
              consectetur ea magna ex ex ut est tempor. Irure ea magna sint do.
              Aute ipsum commodo ullamco cupidatat amet minim esse in. Velit
              nulla reprehenderit minim anim esse qui ad ea commodo proident.
              Exercitation elit elit qui aliqua ullamco. Ullamco magna
              consectetur culpa consequat non nisi ullamco veniam cillum nostrud
              adipisicing deserunt. Consectetur mollit non consequat sunt labore
              nostrud consequat sint nisi ad labore enim anim. Exercitation
              nostrud cillum nisi fugiat est amet exercitation non voluptate
              aliquip eiusmod. Magna in laboris veniam consequat ad nulla
              labore.
            </p>
          </div>
          <div
            className="faq-container"
            onClick={() => {
              this.toggleSlide("6");
            }}
          >
            <div className="faq">
              <p id="6" className="faq-header">
                Come si fa a respirare?
              </p>
              <i
                onClick={() => {
                  this.toggleSlide("6");
                }}
                className={`fa fa-${
                  this.state["6"] ? "minus" : "plus"
                } faq-ico`}
              ></i>
            </div>
            <p className={`faq-answer ${this.state["6"] ? "" : "hidden"}`}>
              lorem Labore non qui elit aute do aliquip ex sint. Amet
              adipisicing do tempor quis labore excepteur sunt cupidatat. Velit
              esse officia pariatur veniam est Sit ea occaecat qui deserunt ex
              veniam. In commodo sit reprehenderit fugiat exercitation do
              exercitation quis consectetur. Voluptate qui aute consectetur
              officia ullamco consequat aliquip nisi cillum sint labore id
              occaecat veniam. Pariatur sit adipisicing veniam esse aliquip anim
              mollit reprehenderit id et incididunt sit fugiat non. Duis
              consectetur ea magna ex ex ut est tempor. Irure ea magna sint do.
              Aute ipsum commodo ullamco cupidatat amet minim esse in. Velit
              nulla reprehenderit minim anim esse qui ad ea commodo proident.
              Exercitation elit elit qui aliqua ullamco. Ullamco magna
              consectetur culpa consequat non nisi ullamco veniam cillum nostrud
              adipisicing deserunt. Consectetur mollit non consequat sunt labore
              nostrud consequat sint nisi ad labore enim anim. Exercitation
              nostrud cillum nisi fugiat est amet exercitation non voluptate
              aliquip eiusmod. Magna in laboris veniam consequat ad nulla
              labore.
            </p>
          </div>
          <div
            className="faq-container"
            onClick={() => {
              this.toggleSlide("7");
            }}
          >
            <div className="faq">
              <p id="7" className="faq-header">
                Come si fa a respirare?
              </p>
              <i
                onClick={() => {
                  this.toggleSlide("7");
                }}
                className={`fa fa-${
                  this.state["7"] ? "minus" : "plus"
                } faq-ico`}
              ></i>
            </div>
            <p className={`faq-answer ${this.state["7"] ? "" : "hidden"}`}>
              lorem Labore non qui elit aute do aliquip ex sint. Amet
              adipisicing do tempor quis labore excepteur sunt cupidatat. Velit
              esse officia pariatur veniam est Sit ea occaecat qui deserunt ex
              veniam. In commodo sit reprehenderit fugiat exercitation do
              exercitation quis consectetur. Voluptate qui aute consectetur
              officia ullamco consequat aliquip nisi cillum sint labore id
              occaecat veniam. Pariatur sit adipisicing veniam esse aliquip anim
              mollit reprehenderit id et incididunt sit fugiat non. Duis
              consectetur ea magna ex ex ut est tempor. Irure ea magna sint do.
              Aute ipsum commodo ullamco cupidatat amet minim esse in. Velit
              nulla reprehenderit minim anim esse qui ad ea commodo proident.
              Exercitation elit elit qui aliqua ullamco. Ullamco magna
              consectetur culpa consequat non nisi ullamco veniam cillum nostrud
              adipisicing deserunt. Consectetur mollit non consequat sunt labore
              nostrud consequat sint nisi ad labore enim anim. Exercitation
              nostrud cillum nisi fugiat est amet exercitation non voluptate
              aliquip eiusmod. Magna in laboris veniam consequat ad nulla
              labore.
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default FAQs;
