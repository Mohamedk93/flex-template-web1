import React, { Component } from 'react';
import { string, func } from 'prop-types';
import { FormattedMessage, intlShape, injectIntl } from '../../util/reactIntl';
import classNames from 'classnames';
import { lazyLoadWithDimensions } from '../../util/contextHelpers';
import { LINE_ITEM_DAY, LINE_ITEM_NIGHT, propTypes } from '../../util/types';
import { formatMoney } from '../../util/currency';
import { ensureListing, ensureUser } from '../../util/data';
import { richText } from '../../util/richText';
import { createSlug } from '../../util/urlHelpers';
import config from '../../config';
import { NamedLink, ResponsiveImage } from '../../components';
import { isMapsLibLoaded } from '../../components/Map/GoogleMap';
import css from './ListingCard.css';

const MIN_LENGTH_FOR_LONG_WORDS = 10;

const priceData = (price, intl) => {
  if (price && price.currency === config.currency) {
    const formattedPrice = formatMoney(intl, price);
    return { formattedPrice, priceTitle: formattedPrice };
  } else if (price) {
    return {
      formattedPrice: intl.formatMessage(
        { id: 'ListingCard.unsupportedPrice' },
        { currency: price.currency }
      ),
      priceTitle: intl.formatMessage(
        { id: 'ListingCard.unsupportedPriceTitle' },
        { currency: price.currency }
      ),
    };
  }
  return {};
};

class ListingImage extends Component {
  render() {
    return <ResponsiveImage {...this.props} />;
  }
}
const LazyImage = lazyLoadWithDimensions(ListingImage, { loadAfterInitialRendering: 3000 });

export const listingAvailablePricesMeta = [
  {
    type: 'priceSeatsHourly',
    unit: 'ListingCard.perHour',
    rentalType: 'hourly'
  },
  {
    type: 'priceSeatsDaily',
    unit: 'ListingCard.perDay',
    rentalType: 'daily'
  },
  {
    type: 'priceSeatsMonthly',
    unit: 'ListingCard.perMonth',
    rentalType: 'monthly'
  },
  {
    type: 'priceOfficeRoomsHourly',
    unit: 'ListingCard.perHour',
    rentalType: 'hourly'
  },
  {
    type: 'priceOfficeRoomsDaily',
    unit: 'ListingCard.perDay',
    rentalType: 'daily'
  },
  {
    type: 'priceOfficeRoomsMonthly',
    unit: 'ListingCard.perMonth',
    rentalType: 'monthly'
  },
  {
    type: 'priceMeetingRoomsHourly',
    unit: 'ListingCard.perHour',
    rentalType: 'hourly'
  },
  {
    type: 'priceMeetingRoomsDaily',
    unit: 'ListingCard.perDay',
    rentalType: 'daily'
  },
  {
    type: 'priceMeetingRoomsMonthly',
    unit: 'ListingCard.perMonth',
    rentalType: 'monthly'
  },
];

export const listingCalculateMinPrice = (pubData) => {
  let min_price_meta = listingAvailablePricesMeta.filter((priceItem) => {
    
    if (!pubData[priceItem.type] || !pubData.rentalTypes) {
      return false;
    }

    if (pubData.rentalTypes.indexOf(priceItem.rentalType) !== -1 && 
      Number(pubData[priceItem.type].amount) > 0) {
      return true
    } else {
      return false
    }
  }).sort((a, b) => {
    let a_val = Number(pubData[a.type] && pubData[a.type].amount);
    let b_val = Number(pubData[b.type] && pubData[b.type].amount);

    if (a_val === b_val) {
      return 0;
    } else if (a_val > b_val) {
      return 1;
    } else {
      return -1;
    }
  })[0];

  return min_price_meta && {
    price: pubData[min_price_meta.type],
    meta: min_price_meta
  }
};

export const ListingCardComponent = props => {
  const { className, rootClassName, intl, listing, renderSizes, setActiveListing, searchPoint } = props;
  const classes = classNames(rootClassName || css.root, className);
  const currentListing = ensureListing(listing);
  const id = currentListing.id.uuid;
  const { title = '', price } = currentListing.attributes;
  const slug = createSlug(title);
  const author = ensureUser(listing.author);
  const authorName = author.attributes.profile.displayName;
  const firstImage =
    currentListing.images && currentListing.images.length > 0 ? currentListing.images[0] : null;

  const { formattedPrice, priceTitle } = priceData(price, intl);

  const unitType = config.bookingUnitType;
  const isNightly = unitType === LINE_ITEM_NIGHT;
  const isDaily = unitType === LINE_ITEM_DAY;

  const { publicData } = currentListing.attributes;
  const city = publicData ? publicData.city : null;
  const country = publicData ? publicData.country : null;

  const listingGeolocation = currentListing.attributes &&
  currentListing.attributes.geolocation ?
  currentListing.attributes.geolocation :null;

  let distance = null;
  if(isMapsLibLoaded() && listingGeolocation && searchPoint) {
    let listingPointCoord = new window.google.maps.LatLng(listingGeolocation.lat, listingGeolocation.lng);
    let searchPointCoord = new window.google.maps.LatLng(searchPoint.lat, searchPoint.lng);
    distance = (window.google.maps.geometry.spherical.computeDistanceBetween(listingPointCoord, searchPointCoord) / 1000).toFixed(2);
  };

  let min_price = listingCalculateMinPrice(publicData);

  const unitTranslationKey = min_price && min_price.meta && min_price.meta.unit || 'ListingCard.perHour';

  const locationInfo = city && country ? (
    <p className={css.locationInfoPar}>
      {`${city}, ${country}`}
    </p>
  ) : null;

  const distanceInfo = distance ? (
    <p className={css.locationInfoPar}>
      {`${distance} km`}
    </p>
  ) : null;

  const categories = config.custom.categoriesDefaultName;
  const category = publicData && publicData.category ? (
    <p className={css.categoryPar}>
      {categories[publicData.category]}
    </p>
  ) : null;

  return (
    <NamedLink className={classes} name="ListingPage" params={{ id, slug }}>
      <div
        className={css.threeToTwoWrapper}
        onMouseEnter={() => setActiveListing(currentListing.id)}
        onMouseLeave={() => setActiveListing(null)}
      >
        <div className={css.category}>
          {category}
        </div>
        <div className={css.locationInfo}>
          {locationInfo}
        </div>
        <div className={css.aspectWrapper}>
          <LazyImage
            rootClassName={css.rootForImage}
            alt={title}
            image={firstImage}
            variants={['landscape-crop', 'landscape-crop2x']}
            sizes={renderSizes}
          />
        </div>
      </div>
      <div className={css.info}>
        <div className={css.price}>
          <div className={css.priceValue} title={priceTitle}>
            {formattedPrice}
          </div>
          <div className={css.perUnit}>
            <FormattedMessage id={unitTranslationKey} />
          </div>
        </div>
        <div className={css.mainInfo}>
          <div className={css.title}>
            {richText(title, {
              longWordMinLength: MIN_LENGTH_FOR_LONG_WORDS,
              longWordClass: css.longWord,
            })}
          </div>
          <div className={css.authorInfo}>
            <FormattedMessage id="ListingCard.hostedBy" values={{ authorName }} />
          </div>
        </div>
      </div>
    </NamedLink>
  );
};

ListingCardComponent.defaultProps = {
  className: null,
  rootClassName: null,
  renderSizes: null,
  setActiveListing: () => null,
};

ListingCardComponent.propTypes = {
  className: string,
  rootClassName: string,
  intl: intlShape.isRequired,
  listing: propTypes.listing.isRequired,

  // Responsive image sizes hint
  renderSizes: string,

  setActiveListing: func,
};

export default injectIntl(ListingCardComponent);
