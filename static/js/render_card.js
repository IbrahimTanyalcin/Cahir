function renderCard(values, d){
    return `
        <div data-simplebar style='
            width: 64%;
            height: ${values.cardHeight};
            overflow:auto;
            background-color:#a18c6ccc;
            overflow-wrap: break-word;
            padding: 0rem 1.4rem;
        '>
            <div style='
                background-color:${
                    values.factionColors[d["data-faction"]]
                };
                border-bottom-right-radius: 0.5rem;
                border-bottom-left-radius: 0.5rem;
            '>
                <h2>${d["data-card-name"]}</h2>
                <h3>${d["data-card-category"]}</h3>
            </div>
            <div>
                <p class="card-body" style='
                    margin-block-start: 0;
                    margin-top:0;
                '>
                    ${d["data-card-body"]}
                </p>
            </div>
        </div>

        <div style='
            background-color: #ffffff;
            height: ${values.cardHeight};
            position: relative;
            width: calc(${
                values.cardHeight
            } * ${
                values.aspectRatio
            });
        '>
            <img src="/static/gwent-chain/img/${
                d?.["data-artid"]?.slice(0,-1)
            }.jpg" ${values.cardImageStyle}>
            <img src="/static/gwent-chain/img/border_${
                d?.["data-color"]
            }.png" ${values.cardImageStyle}>
            ${+d?.["data-power"]
            ? `<img src="/static/gwent-chain/img/default_${
                    d?.["data-faction"]
                }.png" ${values.cardImageStyle}>
                <img src="/static/gwent-chain/img/power_${
                    ("00" + d?.["data-power"]).slice(-2)
                }.png" ${values.cardImageStyle}>`
                : ''
            }
            ${+d?.["data-provision"]
                ? `<img src="/static/gwent-chain/img/provision_${
                    d?.["data-faction"]
                }.png" ${values.cardImageStyle}>
                <img src="/static/gwent-chain/img/provision_${
                    d?.["data-provision"]
                }.png" ${values.cardImageStyle}>`
                : ''
            }
            ${d?.["data-rarity"]
                ? `<img src="/static/gwent-chain/img/rarity_${
                    d?.["data-rarity"]
                }.png" ${values.cardImageStyle}>`
                : ''
            }
            ${+d?.["data-armor"]
                ? `<img src="/static/gwent-chain/img/${
                    'trinket_armor.png"'
                } ${values.cardImageStyle}>
                <img src="/static/gwent-chain/img/armor_${
                    ("00" + d?.["data-armor"]).slice(-2)
                }.png" ${values.cardImageStyle}>`
                : ''
            }
        </div>
    `
}

export const render = renderCard;