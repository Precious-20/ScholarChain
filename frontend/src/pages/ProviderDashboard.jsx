import { useState } from "react";
import { ethers } from "ethers";

function ProviderDashboard({
  walletAddress,
  contract,
  scholarships,
  onRefresh,
  showMessage,
}) {
  const [showCreateForm, setShowCreateForm] =
    useState(false);

  const [selectedScholarship, setSelectedScholarship] =
    useState(null);

  const [applicants, setApplicants] =
    useState({});

  const [loadingApplicants, setLoadingApplicants] =
    useState(false);

  const [processingApplicant, setProcessingApplicant] =
    useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    amount: "",
    deadline: "",
    maxApplicants: "",
  });

  const myScholarships = (scholarships || []).filter(
    (scholarship) =>
      scholarship.provider?.toLowerCase() ===
      walletAddress?.toLowerCase()
  );

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function createScholarship(event) {
    event.preventDefault();

    if (!contract) {
      showMessage(
        "Please connect your wallet first.",
        "error"
      );
      return;
    }

    try {
      if (!form.title.trim()) {
        showMessage(
          "Please enter a scholarship title.",
          "error"
        );
        return;
      }

      if (!form.description.trim()) {
        showMessage(
          "Please enter a scholarship description.",
          "error"
        );
        return;
      }

      if (!form.amount || Number(form.amount) <= 0) {
        showMessage(
          "Please enter a valid funding amount.",
          "error"
        );
        return;
      }

      if (!form.deadline) {
        showMessage(
          "Please choose an application deadline.",
          "error"
        );
        return;
      }

      if (
        new Date(form.deadline).getTime() <=
        Date.now()
      ) {
        showMessage(
          "Please choose a future deadline.",
          "error"
        );
        return;
      }

      if (
        !form.maxApplicants ||
        Number(form.maxApplicants) < 1
      ) {
        showMessage(
          "Maximum applicants must be at least 1.",
          "error"
        );
        return;
      }

      const amount = ethers.parseEther(form.amount);

      const deadline = Math.floor(
        new Date(form.deadline).getTime() / 1000
      );

      const maxApplicants = Number(
        form.maxApplicants
      );

      showMessage(
        "Creating scholarship...",
        "success"
      );

      const tx =
        await contract.createScholarship(
          form.title.trim(),
          form.description.trim(),
          amount,
          deadline,
          maxApplicants,
          {
            value: amount,
          }
        );

      showMessage(
        "Confirm the transaction in MetaMask...",
        "success"
      );

      await tx.wait();

      showMessage(
        "Scholarship created successfully!",
        "success"
      );

      setForm({
        title: "",
        description: "",
        amount: "",
        deadline: "",
        maxApplicants: "",
      });

      setShowCreateForm(false);

      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error(
        "Create scholarship error:",
        error
      );

      showMessage(
        error?.reason ||
          error?.shortMessage ||
          error?.message ||
          "Unable to create scholarship.",
        "error"
      );
    }
  }

  async function cancelScholarship(scholarshipId) {
    if (!contract) {
      showMessage(
        "Please connect your wallet first.",
        "error"
      );
      return;
    }

    try {
      showMessage(
        "Cancelling scholarship...",
        "success"
      );

      const tx =
        await contract.cancelScholarship(
          scholarshipId
        );

      showMessage(
        "Confirm the cancellation in MetaMask...",
        "success"
      );

      await tx.wait();

      showMessage(
        "Scholarship cancelled successfully!",
        "success"
      );

      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error(
        "Cancel scholarship error:",
        error
      );

      showMessage(
        error?.reason ||
          error?.shortMessage ||
          error?.message ||
          "Unable to cancel scholarship.",
        "error"
      );
    }
  }

  async function loadApplicants(scholarshipId) {
    if (!contract) return;

    try {
      setLoadingApplicants(true);
      setSelectedScholarship(scholarshipId);

      const provider =
        contract.runner?.provider;

      if (!provider) {
        throw new Error(
          "Blockchain provider unavailable."
        );
      }

      const contractAddress =
        await contract.getAddress();

      /*
       * Instead of using:
       *
       * readContract.queryFilter(...)
       *
       * we retrieve the logs in smaller block ranges.
       *
       * This avoids RPC "could not coalesce error"
       * problems caused by querying a very large block range.
       */

      const latestBlock =
        await provider.getBlockNumber();

      const event =
        contract.interface.getEvent(
          "ScholarshipApplied"
        );

      const eventTopic =
        event.topicHash;

      const scholarshipTopic =
        ethers.zeroPadValue(
          ethers.toBeHex(scholarshipId),
          32
        );

      const loadedApplicants = [];
      const seenStudents = new Set();

      const chunkSize = 2000;

      /*
       * Search backwards through recent blocks.
       * This is enough for the scholarships created
       * during the current project/testing period.
       */
      const minimumBlock = Math.max(
        0,
        latestBlock - 100000
      );

      for (
        let fromBlock = latestBlock;
        fromBlock >= minimumBlock;
        fromBlock -= chunkSize
      ) {
        const toBlock = fromBlock;

        const chunkStart = Math.max(
          minimumBlock,
          fromBlock - chunkSize + 1
        );

        const logs =
          await provider.getLogs({
            address: contractAddress,
            topics: [
              eventTopic,
              scholarshipTopic,
            ],
            fromBlock: chunkStart,
            toBlock,
          });

        for (const log of logs) {
          try {
            const parsed =
              contract.interface.parseLog({
                topics: [...log.topics],
                data: log.data,
              });

            if (!parsed) continue;

            const student =
              parsed.args.student;

            if (!student) continue;

            const normalizedStudent =
              student.toLowerCase();

            if (
              seenStudents.has(
                normalizedStudent
              )
            ) {
              continue;
            }

            seenStudents.add(
              normalizedStudent
            );

            const application =
              await contract.applications(
                scholarshipId,
                student
              );

            loadedApplicants.push({
              student,
              approved:
                application.approved,
              paid:
                application.paid,
            });
          } catch (parseError) {
            console.error(
              "Unable to parse applicant event:",
              parseError
            );
          }
        }

        /*
         * Once we have found as many applicants as
         * the contract says exist, there is no need
         * to continue scanning older blocks.
         */
        const scholarship =
          (scholarships || []).find(
            (item) =>
              Number(item.id) ===
              Number(scholarshipId)
          );

        const expectedApplicants =
          Number(
            scholarship?.applicantCount || 0
          );

        if (
          expectedApplicants > 0 &&
          loadedApplicants.length >=
            expectedApplicants
        ) {
          break;
        }

        if (chunkStart === minimumBlock) {
          break;
        }
      }

      setApplicants((previous) => ({
        ...previous,
        [scholarshipId]:
          loadedApplicants,
      }));

      if (loadedApplicants.length === 0) {
        showMessage(
          "No applicants found for this scholarship.",
          "success"
        );
      } else {
        showMessage(
          `${loadedApplicants.length} applicant${
            loadedApplicants.length === 1
              ? ""
              : "s"
          } loaded successfully.`,
          "success"
        );
      }
    } catch (error) {
      console.error(
        "Load applicants error:",
        error
      );

      showMessage(
        error?.reason ||
          error?.shortMessage ||
          error?.message ||
          "Unable to load applicants.",
        "error"
      );
    } finally {
      setLoadingApplicants(false);
    }
  }

  async function approveApplicant(
    scholarshipId,
    student
  ) {
    if (!contract) {
      showMessage(
        "Please connect your wallet first.",
        "error"
      );
      return;
    }

    try {
      setProcessingApplicant(
        `${scholarshipId}-${student}-approve`
      );

      showMessage(
        "Approving applicant...",
        "success"
      );

      const tx =
        await contract.approveApplication(
          scholarshipId,
          student
        );

      showMessage(
        "Confirm the approval in MetaMask...",
        "success"
      );

      await tx.wait();

      showMessage(
        "Applicant approved successfully!",
        "success"
      );

      await loadApplicants(scholarshipId);

      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error(
        "Approve applicant error:",
        error
      );

      showMessage(
        error?.reason ||
          error?.shortMessage ||
          error?.message ||
          "Unable to approve applicant.",
        "error"
      );
    } finally {
      setProcessingApplicant("");
    }
  }

  async function payApplicant(
    scholarshipId,
    student
  ) {
    if (!contract) {
      showMessage(
        "Please connect your wallet first.",
        "error"
      );
      return;
    }

    try {
      setProcessingApplicant(
        `${scholarshipId}-${student}-pay`
      );

      showMessage(
        "Preparing scholarship payment...",
        "success"
      );

      const tx =
        await contract.payScholarship(
          scholarshipId,
          student
        );

      showMessage(
        "Confirm the scholarship payment in MetaMask...",
        "success"
      );

      await tx.wait();

      showMessage(
        "Scholarship paid successfully!",
        "success"
      );

      await loadApplicants(scholarshipId);

      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error(
        "Pay applicant error:",
        error
      );

      showMessage(
        error?.reason ||
          error?.shortMessage ||
          error?.message ||
          "Unable to pay applicant.",
        "error"
      );
    } finally {
      setProcessingApplicant("");
    }
  }

  return (
    <section
      className="provider-section"
      id="provider"
    >
      <div className="provider-container">

        <div className="provider-heading">
          <div>
            <span className="section-eyebrow">
              PROVIDER DASHBOARD
            </span>

            <h2>Manage Scholarships</h2>

            <p>
              Create scholarships, review applicants
              and distribute funds directly through
              the blockchain.
            </p>
          </div>

          <button
            className="provider-create-button"
            onClick={() =>
              setShowCreateForm(
                (previous) => !previous
              )
            }
          >
            {showCreateForm
              ? "Close Form"
              : "+ Create Scholarship"}
          </button>
        </div>

        {showCreateForm && (
          <form
            className="provider-form"
            onSubmit={createScholarship}
          >
            <div className="provider-form-grid">

              <div className="provider-field">
                <label>
                  Scholarship Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Web3 Developer Scholarship"
                  required
                />
              </div>

              <div className="provider-field">
                <label>
                  Funding Amount (ETH)
                </label>

                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="0.001"
                  min="0"
                  step="0.0001"
                  required
                />
              </div>

              <div className="provider-field provider-field-full">
                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe the scholarship..."
                  rows="4"
                  required
                />
              </div>

              <div className="provider-field">
                <label>
                  Application Deadline
                </label>

                <input
                  type="datetime-local"
                  name="deadline"
                  value={form.deadline}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="provider-field">
                <label>
                  Maximum Applicants
                </label>

                <input
                  type="number"
                  name="maxApplicants"
                  value={form.maxApplicants}
                  onChange={handleChange}
                  placeholder="5"
                  min="1"
                  required
                />
              </div>

            </div>

            <button
              className="provider-submit-button"
              type="submit"
            >
              Create & Fund Scholarship
            </button>
          </form>
        )}

        <div className="provider-summary">

          <div>
            <span>MY SCHOLARSHIPS</span>

            <strong>
              {myScholarships.length}
            </strong>
          </div>

          <div>
            <span>WALLET</span>

            <strong>
              {walletAddress
                ? `${walletAddress.slice(
                    0,
                    6
                  )}...${walletAddress.slice(-4)}`
                : "Not connected"}
            </strong>
          </div>

        </div>

        <div className="provider-scholarship-list">

          {myScholarships.length === 0 ? (
            <div className="provider-empty">
              <h3>No scholarships yet</h3>

              <p>
                Create your first scholarship using
                the button above.
              </p>
            </div>
          ) : (
            myScholarships.map(
              (scholarship) => {

                const scholarshipApplicants =
                  applicants[
                    scholarship.id
                  ] || [];

                return (
                  <article
                    className="provider-scholarship"
                    key={scholarship.id}
                  >

                    <div className="provider-scholarship-top">

                      <div>
                        <span className="provider-number">
                          #{scholarship.id}
                        </span>

                        <h3>
                          {scholarship.title}
                        </h3>

                        <p>
                          {scholarship.description}
                        </p>
                      </div>

                      <span
                        className={
                          scholarship.active
                            ? "provider-status active"
                            : "provider-status closed"
                        }
                      >
                        {scholarship.active
                          ? "ACTIVE"
                          : "CLOSED"}
                      </span>

                    </div>

                    <div className="provider-metrics">

                      <div>
                        <span>FUNDING</span>

                        <strong>
                          {scholarship.amount} ETH
                        </strong>
                      </div>

                      <div>
                        <span>APPLICANTS</span>

                        <strong>
                          {scholarship.applicantCount ||
                            0}{" "}
                          /{" "}
                          {scholarship.maxApplicants}
                        </strong>
                      </div>

                      <div>
                        <span>DEADLINE</span>

                        <strong>
                          {scholarship.deadline}
                        </strong>
                      </div>

                    </div>

                    <div className="provider-actions">

                      <button
                        onClick={() =>
                          loadApplicants(
                            scholarship.id
                          )
                        }
                        disabled={
                          loadingApplicants &&
                          selectedScholarship ===
                            scholarship.id
                        }
                      >
                        {loadingApplicants &&
                        selectedScholarship ===
                          scholarship.id
                          ? "Loading..."
                          : "View Applicants"}
                      </button>

                      {scholarship.active && (
                        <button
                          className="danger"
                          onClick={() =>
                            cancelScholarship(
                              scholarship.id
                            )
                          }
                        >
                          Cancel Scholarship
                        </button>
                      )}

                    </div>

                    {selectedScholarship ===
                      scholarship.id && (
                      <div className="provider-applicants">

                        <div className="provider-applicants-heading">
                          <h4>
                            Applicants
                          </h4>

                          <span>
                            {
                              scholarshipApplicants.length
                            }{" "}
                            applicant
                            {scholarshipApplicants.length ===
                            1
                              ? ""
                              : "s"}
                          </span>
                        </div>

                        {scholarshipApplicants.length ===
                        0 ? (
                          <p className="provider-no-applicants">
                            No applicants yet.
                          </p>
                        ) : (
                          scholarshipApplicants.map(
                            (applicant) => {

                              const approveKey =
                                `${scholarship.id}-${applicant.student}-approve`;

                              const payKey =
                                `${scholarship.id}-${applicant.student}-pay`;

                              return (
                                <div
                                  className="provider-applicant"
                                  key={
                                    applicant.student
                                  }
                                >
                                  <div>
                                    <strong>
                                      {applicant.student.slice(
                                        0,
                                        6
                                      )}
                                      ...
                                      {applicant.student.slice(
                                        -4
                                      )}
                                    </strong>

                                    <span>
                                      {applicant.paid
                                        ? "PAID"
                                        : applicant.approved
                                          ? "APPROVED"
                                          : "PENDING"}
                                    </span>
                                  </div>

                                  <div className="provider-applicant-actions">

                                    {!applicant.approved &&
                                      !applicant.paid && (
                                        <button
                                          onClick={() =>
                                            approveApplicant(
                                              scholarship.id,
                                              applicant.student
                                            )
                                          }
                                          disabled={
                                            processingApplicant ===
                                            approveKey
                                          }
                                        >
                                          {processingApplicant ===
                                          approveKey
                                            ? "Approving..."
                                            : "Approve"}
                                        </button>
                                      )}

                                    {applicant.approved &&
                                      !applicant.paid && (
                                        <button
                                          onClick={() =>
                                            payApplicant(
                                              scholarship.id,
                                              applicant.student
                                            )
                                          }
                                          disabled={
                                            processingApplicant ===
                                            payKey
                                          }
                                        >
                                          {processingApplicant ===
                                          payKey
                                            ? "Paying..."
                                            : "Pay Applicant"}
                                        </button>
                                      )}

                                  </div>
                                </div>
                              );
                            }
                          )
                        )}

                      </div>
                    )}

                  </article>
                );
              }
            )
          )}

        </div>
      </div>
    </section>
  );
}

export default ProviderDashboard;