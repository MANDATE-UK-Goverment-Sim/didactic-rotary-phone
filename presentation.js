(() => {

  const D =
    window.USHER_DATA;

  const U =
    window.USHER;

  const qs =
    new URLSearchParams(
      location.search
    );

  if(
    qs.get('embed') === '1'
  ){
    document
      .getElementById('app')
      .classList
      .add('embed');
  }

  const $ =
    s =>
      document.querySelector(s);

  const $$ =
    s =>
      [
        ...document.querySelectorAll(s)
      ];

  const pmap =
    Object.fromEntries(
      D.parties.map(
        p => [p.id,p]
      )
    );

  const fmt =
    n =>
      Number(
        n || 0
      ).toLocaleString(
        'en-GB'
      );

  const resultForSeat =
    (state,s) =>
      state.seatResults[s.id] ||
      null;

  const resultForCouncil =
    (state,c) =>
      state.councilResults[c.id] ||
      null;

  function color(id){
    return (
      pmap[id]?.color ||
      '#7a8594'
    );
  }

  function declaredSeatTotals(state){

    const out =
      Object.fromEntries(
        D.parties.map(
          p => [p.id,0]
        )
      );

    Object
      .values(
        state.seatResults
      )
      .forEach(r => {

        if(
          out[r.party] != null
        ){
          out[r.party]++;
        }

      });

    return out;
  }

  function declaredCouncilTotals(state){

    const out =
      Object.fromEntries(
        D.parties.map(
          p => [p.id,0]
        )
      );

    Object
      .values(
        state.councilResults
      )
      .forEach(r => {

        if(
          out[r.party] != null
        ){
          out[r.party]++;
        }

      });

    return out;
  }

  function renderMap(
    el,
    state
  ){

    if(!el){
      return;
    }

    el.innerHTML = '';

    D.constituencies
      .forEach((s,i) => {

        const d =
          document.createElement(
            'span'
          );

        d.className =
          'map-cell' +
          (
            state.seatResults[s.id]
              ? ' declared'
              : ''
          );

        d.title =
          s.name;

        d.style.left =
          `${
            3 +
            (s.mapX%54)*1.72
          }%`;

        d.style.top =
          `${
            4 +
            (s.mapY%34)*2.68
          }%`;

        d.style.background =
          state.seatResults[s.id]
            ? color(
                state
                  .seatResults[s.id]
                  .party
              )
            : '#cfd9e3';

        el.appendChild(d);
      });
  }

  function renderPartyStrip(state){

    const el =
      $('#partyStrip');

    el.innerHTML = '';

    D.parties.forEach(p => {

      const seats =
        state.exitPoll[p.id] ||
        0;

      const chg =
        state
          .exitPollChanges[p.id] ||
        0;

      const d =
        document.createElement(
          'div'
        );

      d.className =
        'party-block';

      d.style.background =
        `linear-gradient(
          180deg,
          ${p.color},
          ${p.dark}
        )`;

      d.innerHTML = `
        <div class="abbr">
          ${p.short}
        </div>

        <div class="seats">
          ${seats}
        </div>

        <div class="chg">
          ${
            chg >= 0
              ? '▲ +'
              : '▼ '
          }${Math.abs(chg)}
        </div>
      `;

      el.appendChild(d);
    });

    const ranked =
      [...D.parties]
        .sort(
          (a,b) =>
            (
              state.exitPoll[b.id] ||
              0
            ) -
            (
              state.exitPoll[a.id] ||
              0
            )
        );

    const top =
      ranked[0];

    const topSeats =
      state.exitPoll[top.id] ||
      0;

    $('#largestParty')
      .textContent =
        `${top.name} ${topSeats}`;

    $('#majorityStatus')
      .textContent =
        topSeats >= 326
          ? `${top.name} majority`
          : 'Hung parliament';

    $('#exitHeadline')
      .textContent =
        topSeats >= 400
          ? `${top.name} LANDSLIDE`
          : topSeats >= 326
            ? `${top.name} MAJORITY`
            : 'HUNG PARLIAMENT';

    $('#exitSub')
      .textContent =
        topSeats >= 326
          ? `${top.name} projected to secure an overall majority`
          : 'No party secures an overall majority';
  }

  function rowsForShares(shares){

    return D.parties
      .map(
        p => `
          <div class="bar-row">

            <span class="bar-label">
              ${p.name}
            </span>

            <div class="bar-track">

              <div
                class="bar-fill"
                style="
                  width:${shares[p.id]}%;
                  background:${p.color}
                "
              ></div>

            </div>

            <span class="bar-value">
              ${shares[p.id]}%
            </span>

          </div>
        `
      )
      .join('');
  }

  function renderSeat(state){

    const s =
      D.constituencies
        .find(
          x =>
            x.id ===
            state.selectedSeat
        ) ||
      D.constituencies[0];

    const result =
      resultForSeat(
        state,
        s
      );

    const predicted =
      result?.party ||
      s.prediction;

    const prev =
      pmap[s.previous];

    const pred =
      pmap[predicted];

    const change =
      predicted === s.previous
        ? 'HOLD'
        : `GAIN FROM ${prev.short}`;

    $('#seatFocus')
      .innerHTML = `
        <div class="focus-title">

          <div>

            <div class="kicker">
              Constituency focus ·
              ${s.region}
            </div>

            <h2 class="display">
              ${s.name}
            </h2>

            <div class="focus-meta">
              ${fmt(s.electorate)} electors
              &nbsp;·&nbsp;
              turnout ${s.turnout}%
              &nbsp;·&nbsp;
              seat ${s.id}
            </div>

          </div>

          <div
            class="badge"
            style="
              border-color:${pred.color};
              color:${pred.color}
            "
          >
            ${
              result
                ? 'DECLARED'
                : 'PROJECTED'
            }
            ·
            ${change}
          </div>

        </div>

        <div class="two-panel">

          <div class="result-panel">

            <header>
              Previous election result
            </header>

            <div class="likelihood-hero">

              <small>
                Previous winner
              </small>

              <strong
                style="
                  color:${prev.color}
                "
              >
                ${prev.name}
              </strong>

            </div>

            <div class="result-bars">
              ${
                rowsForShares(
                  s.previousShares
                )
              }
            </div>

          </div>

          <div class="result-panel">

            <header>
              ${
                result
                  ? 'Declared result'
                  : 'Exit poll seat projection'
              }
            </header>

            <div class="likelihood-hero">

              <small>
                ${
                  result
                    ? 'Winner'
                    : 'Projected winner'
                }
              </small>

              <strong
                style="
                  color:${pred.color}
                "
              >
                ${pred.name}
              </strong>

              <div
                style="
                  margin-top:8px;
                  color:#627188;
                  font-weight:800
                "
              >
                ${
                  result
                    ? `Majority ${fmt(result.majority)}`
                    : `Likelihood ${s.likelihood}%`
                }
              </div>

            </div>

            <div class="result-bars">
              ${
                rowsForShares(
                  s.predictedShares
                )
              }
            </div>

          </div>

        </div>

        <div class="callout">

          <strong>
            ${change}.
          </strong>

          ${
            result
              ? `${pred.name} has won ${s.name} with a majority of ${fmt(result.majority)}.`
              : `Our seat model gives ${pred.name} a ${s.likelihood}% likelihood of winning this constituency.`
          }

        </div>
      `;
  }

  function renderCouncil(state){

    const c =
      D.councils.find(
        x =>
          x.id ===
          state.selectedCouncil
      ) ||
      D.councils[0];

    const r =
      resultForCouncil(
        state,
        c
      );

    const winner =
      r?.party ||
      c.prediction;

    const prev =
      pmap[c.previous];

    const next =
      pmap[winner];

    const change =
      winner === c.previous
        ? 'HOLD'
        : `GAIN FROM ${prev.short}`;

    const totals =
      declaredCouncilTotals(
        state
      );

    const latest =
      Object
        .entries(
          state.councilResults
        )
        .slice(-9)
        .reverse();

    $('#councilFocus')
      .innerHTML = `

        <div class="card council-main">

          <div class="kicker">
            Council election ·
            ${c.region}
          </div>

          <h2 class="display">
            ${c.name}
          </h2>

          <div class="focus-meta">
            ${c.seats} councillor seats
            ·
            ${
              r
                ? 'DECLARED'
                : 'projection'
            }
          </div>

          <div class="control-comparison">

            <div
              class="control-box"
              style="
                background:${prev.color}
              "
            >

              <small>
                Previous control
              </small>

              <strong>
                ${prev.name}
              </strong>

            </div>

            <div class="arrow-big">
              →
            </div>

            <div
              class="control-box"
              style="
                background:${next.color}
              "
            >

              <small>
                ${
                  r
                    ? 'New control'
                    : 'Projected control'
                }
              </small>

              <strong>
                ${next.name}
              </strong>

              <span
                style="
                  margin-top:10px;
                  font-weight:900
                "
              >
                ${change}
              </span>

            </div>

          </div>

          <div class="callout">

            ${
              r
                ? `${next.name} ${
                    change === 'HOLD'
                      ? 'holds'
                      : 'takes control of'
                  } ${c.name}. Councillor net change: ${
                    r.change >= 0
                      ? '+'
                      : ''
                  }${r.change}.`
                : `Current projection: ${next.name} ${
                    change === 'HOLD'
                      ? 'hold'
                      : 'gain'
                  }.`
            }

          </div>

        </div>

        <div class="card council-list">

          <div class="kicker">
            Council scoreboard
          </div>

          <h3>
            ${
              Object.keys(
                state.councilResults
              ).length
            }
            /
            ${D.councils.length}
            councils declared
          </h3>

          <div
            class="seat-totals"
            style="
              grid-template-columns:
              repeat(4,1fr);
              margin-bottom:18px
            "
          >

            ${
              D.parties
                .slice(0,4)
                .map(
                  p => `
                    <div
                      class="seat-chip"
                      style="
                        background:${p.color}
                      "
                    >

                      <small>
                        ${p.short}
                      </small>

                      <strong>
                        ${totals[p.id]}
                      </strong>

                    </div>
                  `
                )
                .join('')
            }

          </div>

          <h3>
            Latest council declarations
          </h3>

          ${
            latest.length
              ? latest.map(
                  ([id,res]) => {

                    const cc =
                      D.councils.find(
                        x =>
                          x.id === id
                      );

                    const pp =
                      pmap[res.party];

                    return `
                      <div
                        class="
                          council-result-row
                        "
                      >

                        <span>
                          ${
                            cc?.name ||
                            id
                          }
                        </span>

                        <span
                          class="pill"
                          style="
                            background:
                            ${pp.color}
                          "
                        >
                          ${pp.short}
                        </span>

                      </div>
                    `;
                  }
                ).join('')
              : `
                <p class="muted">
                  No councils declared yet.
                </p>
              `
          }

        </div>
      `;
  }

  function renderNational(state){

    renderMap(
      $('#nationalMap'),
      state
    );

    const totals =
      declaredSeatTotals(
        state
      );

    $('#seatTotals')
      .innerHTML =
        D.parties
          .map(
            p => `
              <div
                class="seat-chip"
                style="
                  background:${p.color}
                "
              >

                <small>
                  ${p.short}
                </small>

                <strong>
                  ${totals[p.id]}
                </strong>

              </div>
            `
          )
          .join('');

    const latest =
      Object
        .entries(
          state.seatResults
        )
        .slice(-8)
        .reverse();

    $('#latestDeclarations')
      .innerHTML =
        latest.length
          ? latest.map(
              ([id,r]) => {

                const s =
                  D.constituencies.find(
                    x =>
                      x.id === id
                  );

                const p =
                  pmap[r.party];

                return `
                  <div class="latest-row">

                    <strong>
                      ${
                        s?.name ||
                        id
                      }
                    </strong>

                    <span>
                      ${
                        fmt(
                          r.majority
                        )
                      }
                      majority
                    </span>

                    <span
                      class="result-pill"
                      style="
                        background:
                        ${p.color}
                      "
                    >
                      ${p.short}
                    </span>

                  </div>
                `;
              }
            ).join('')
          : `
            <div class="muted">
              No declarations yet.
              Results will appear here live.
            </div>
          `;
  }

  // =========================================================
  // FIXED HISTORY CHART
  // =========================================================

  function renderHistory(state){

    const pid =
      state.historyParty ||
      'lab';

    const p =
      pmap[pid] ||
      D.parties[0];

    const raw =
      Array.isArray(
        D.history?.[pid]
      )
        ? D.history[pid]
        : [];

    const arr =
      raw
        .map(
          (x,i) => {

            if(
              typeof x === 'number'
            ){
              return {
                year:
                  D.historyYears?.[i] ??
                  '',

                seats:
                  Number(x) ||
                  0
              };
            }

            return {
              year:
                x?.year ??
                D.historyYears?.[i] ??
                '',

              seats:
                Number(
                  x?.seats
                ) ||
                0
            };
          }
        )
        .filter(
          x =>
            x.year !== ''
        );

    const max =
      Math.max(
        326,
        ...arr.map(
          x =>
            x.seats
        )
      );

    const bars =
      arr
        .map(
          (x,i) => {

            const pct =
              max > 0
                ? (
                    x.seats /
                    max
                  ) * 100
                : 0;

            const highlighted =
              i ===
              arr.length - 1;

            return `
              <div class="history-bar-wrap">

                <div class="history-value">
                  ${x.seats}
                </div>

                <div
                  class="history-bar"
                  style="
                    height:${
                      Math.max(
                        x.seats > 0
                          ? 3
                          : 0,
                        pct
                      )
                    }%;

                    background:${
                      highlighted
                        ? '#ff8b95'
                        : p.color
                    };
                  "
                  title="
                    ${x.year}:
                    ${x.seats} seats
                  "
                ></div>

                <div class="history-year">
                  ${x.year}
                </div>

              </div>
            `;
          }
        )
        .join('');

    const latest =
      arr[
        arr.length - 1
      ];

    $('#historyCard')
      .innerHTML = `

        <div class="kicker">
          Election history
        </div>

        <h2 class="display">
          ${p.name.toUpperCase()}
          SEATS AT GENERAL ELECTIONS
        </h2>

        <div class="history-chart">
          ${bars}
        </div>

        <div class="history-legend">

          <span
            class="legend-dot"
            style="
              background:${p.color}
            "
          ></span>

          <strong>
            ${p.name}
          </strong>

          <span class="muted">
            Official Usher history
            ${
              latest
                ? `· ${latest.year}: ${latest.seats} seats`
                : ''
            }
          </span>

        </div>
      `;
  }

  function renderResults(state){

    const totals =
      declaredSeatTotals(
        state
      );

    const declared =
      Object.keys(
        state.seatResults
      ).length;

    const leader =
      [...D.parties]
        .sort(
          (a,b) =>
            totals[b.id] -
            totals[a.id]
        )[0];

    const pct =
      Math.min(
        100,
        declared / 650 * 100
      );

    $('#resultsCard')
      .innerHTML = `

        <div class="results-header">

          <div>

            <div class="kicker">
              General election results
            </div>

            <h2 class="display">
              ${declared}
              of
              650
              seats declared
            </h2>

          </div>

          <div class="badge">
            ${
              declared
                ? `${leader.name} currently largest party`
                : 'Awaiting first declaration'
            }
          </div>

        </div>

        <div class="majority-rule">

          <div
            class="majority-fill"
            style="
              width:${pct}%
            "
          ></div>

          <div class="majority-mark"></div>

        </div>

        <table class="results-table">

          <thead>
            <tr>
              <th>Party</th>
              <th>Declared seats</th>
              <th>Exit poll</th>
              <th>Change</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>

            ${
              D.parties
                .map(
                  p => `
                    <tr>

                      <td>

                        <span
                          class="party-swatch"
                          style="
                            background:${p.color}
                          "
                        ></span>

                        <strong>
                          ${p.name}
                        </strong>

                      </td>

                      <td
                        style="
                          font-size:25px;
                          font-weight:900
                        "
                      >
                        ${totals[p.id]}
                      </td>

                      <td>
                        ${
                          state.exitPoll[p.id] ||
                          0
                        }
                      </td>

                      <td>
                        ${
                          (
                            state
                              .exitPollChanges[p.id] ||
                            0
                          ) >= 0
                            ? '+'
                            : ''
                        }${
                          state
                            .exitPollChanges[p.id] ||
                          0
                        }
                      </td>

                      <td>
                        ${
                          totals[p.id] >= 326
                            ? 'MAJORITY SECURED'
                            : totals[p.id] > 0
                              ? 'DECLARING'
                              : '—'
                        }
                      </td>

                    </tr>
                  `
                )
                .join('')
            }

          </tbody>

        </table>
      `;
  }

  function renderWinner(state){

    const p =
      pmap[
        state.winnerParty
      ] ||
      pmap.lab;

    $('#winnerCard')
      .innerHTML = `

        <div
          class="flare"
          style="
            background:${p.color}
          "
        ></div>

        <div class="inner">

          <img
            src="logo.svg"
            alt=""
          >

          <div
            class="kicker"
            style="
              color:#c9d4e0;
              margin-top:30px
            "
          >
            Election result
          </div>

          <h2 class="display">
            ${p.name} WINS
          </h2>

          <p>
            ${p.name}
            is declared the winner
            of the Usher General Election.
          </p>

        </div>
      `;
  }

  function updateTicker(state){

    $('#tickerTrack')
      .innerHTML =
        [
          ...state.ticker,
          ...state.ticker
        ]
        .map(
          t => `
            <span class="ticker-item">

              <time>
                ${t.time}
              </time>

              ${t.text}

            </span>
          `
        )
        .join('');
  }

  function countdownText(target){

    let ms =
      new Date(target) -
      new Date();

    if(ms < 0){
      ms = 0;
    }

    const h =
      Math.floor(
        ms / 3600000
      );

    const m =
      Math.floor(
        ms % 3600000 /
        60000
      );

    const s =
      Math.floor(
        ms % 60000 /
        1000
      );

    return [
      h,
      m,
      s
    ]
    .map(
      v =>
        String(v)
          .padStart(
            2,
            '0'
          )
    )
    .join(':');
  }

  function tick(){

    const st =
      U.getState();

    const now =
      new Date();

    $('#liveClock')
      .textContent =
        now.toLocaleTimeString(
          'en-GB',
          {
            hour:'2-digit',
            minute:'2-digit',
            second:'2-digit'
          }
        );

    $('#todayLabel')
      .textContent =
        now.toLocaleDateString(
          'en-GB',
          {
            weekday:'short',
            day:'numeric',
            month:'short',
            year:'numeric'
          }
        );

    const c =
      countdownText(
        st.exitPollTime
      );

    [
      '#headerCountdown',
      '#openingCountdown',
      '#bigCountdown'
    ]
    .forEach(s => {

      const el =
        $(s);

      if(el){
        el.textContent = c;
      }

    });
  }

  setInterval(
    tick,
    250
  );

  tick();

  U.subscribe(
    state => {

      $$('.slide')
        .forEach(
          x =>
            x.classList
              .remove('active')
        );

      const slide =
        $(
          `#slide-${state.currentSlide}`
        ) ||
        $('#slide-opening');

      slide.classList
        .add('active');

      $('#modeBadge')
        .textContent =
          state.mode === 'council'
            ? 'Council Elections'
            : 'General Election';

      renderPartyStrip(state);

      renderMap(
        $('#exitMap'),
        state
      );

      renderNational(state);

      renderSeat(state);

      renderCouncil(state);

      renderHistory(state);

      renderResults(state);

      renderWinner(state);

      updateTicker(state);

      $('#exitDeclared')
        .textContent =
          `${
            Object.keys(
              state.seatResults
            ).length
          } / 650`;

      $('#exitCouncils')
        .textContent =
          `${
            Object.keys(
              state.councilResults
            ).length
          } / 128`;
    }
  );

})();
